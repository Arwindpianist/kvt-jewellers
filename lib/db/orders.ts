import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { generatePaymentReference } from '@/lib/payment-reference'
import { fetchGoldPriceUSD, fetchSilverPriceUSD } from '@/lib/gold-price-api'
import { fetchExchangeRates } from '@/lib/currency-converter'
import { getPriceHistory } from '@/lib/db/price-history'

type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']

export interface OrderWithItems extends OrderRow {
  order_items: Array<{
    id: string
    product_id: string
    quantity: number
    price_at_purchase: number
    metal_price_usd?: number | null
    exchange_rate_myr?: number | null
    exchange_rate_inr?: number | null
    pricing_metadata?: any
    product: {
      id: string
      name: string
      image: string | null
    }
  }>
  payment: {
    id: string
    status: string
  } | null
}

/**
 * Create a new order
 */
export async function createOrder(
  userId: string,
  items: Array<{
    productId: string
    quantity: number
    price: number
    metadata?: {
      metalType?: string
      metalPriceUSD?: number
      exchangeRateMYR?: number
      exchangeRateINR?: number
      currency?: string
      weight?: number
      purity?: number
    }
  }>
): Promise<{ order: OrderWithItems | null; error: string | null }> {
  const supabase = await createClient()

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Generate payment reference
  const paymentReference = generatePaymentReference()

  // Create order
  const orderData: OrderInsert = {
    user_id: userId,
    status: 'pending',
    total,
    payment_reference: paymentReference,
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (orderError || !order) {
    return { order: null, error: orderError?.message || 'Failed to create order' }
  }

  // Capture comprehensive price analytics at purchase time
  // Fetch all current prices and exchange rates
  const [goldPriceUSD, silverPriceUSD, exchangeRates] = await Promise.all([
    fetchGoldPriceUSD(),
    fetchSilverPriceUSD(),
    fetchExchangeRates(),
  ])

  // Get price history snapshot (last 3 records per price type)
  const priceHistorySnapshot = await Promise.all([
    getPriceHistory('GOLD_USD', 7, 3),
    getPriceHistory('SILVER_USD', 7, 3),
    getPriceHistory('MYR_USD', 7, 3),
    getPriceHistory('MYR_INR', 7, 3),
    getPriceHistory('GOLD_USD_24H', 7, 3),
    getPriceHistory('SILVER_USD_24H', 7, 3),
    getPriceHistory('MYR_USD_24H', 7, 3),
    getPriceHistory('MYR_INR_24H', 7, 3),
  ])

  const priceHistoryData = {
    GOLD_USD: priceHistorySnapshot[0],
    SILVER_USD: priceHistorySnapshot[1],
    MYR_USD: priceHistorySnapshot[2],
    MYR_INR: priceHistorySnapshot[3],
    GOLD_USD_24H: priceHistorySnapshot[4],
    SILVER_USD_24H: priceHistorySnapshot[5],
    MYR_USD_24H: priceHistorySnapshot[6],
    MYR_INR_24H: priceHistorySnapshot[7],
  }

  // Prepare all metal prices and exchange rates
  const allMetalPrices = {
    gold: {
      USD: goldPriceUSD,
      MYR: goldPriceUSD * exchangeRates.MYR,
      INR: goldPriceUSD * exchangeRates.INR,
    },
    silver: {
      USD: silverPriceUSD,
      MYR: silverPriceUSD * exchangeRates.MYR,
      INR: silverPriceUSD * exchangeRates.INR,
    },
  }

  const allExchangeRates = {
    MYR_USD: exchangeRates.MYR,
    INR_USD: exchangeRates.INR,
    MYR_INR: exchangeRates.INR / exchangeRates.MYR,
  }

  // Create order items with comprehensive pricing analytics
  const orderItems: OrderItemInsert[] = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    price_at_purchase: item.price,
    metal_price_usd: item.metadata?.metalPriceUSD || null,
    exchange_rate_myr: item.metadata?.exchangeRateMYR || null,
    exchange_rate_inr: item.metadata?.exchangeRateINR || null,
    // New comprehensive analytics columns
    gold_price_usd_at_purchase: goldPriceUSD,
    silver_price_usd_at_purchase: silverPriceUSD,
    exchange_rate_myr_usd_at_purchase: exchangeRates.MYR,
    exchange_rate_inr_usd_at_purchase: exchangeRates.INR,
    price_history_snapshot: priceHistoryData,
    all_metal_prices_at_purchase: allMetalPrices,
    all_exchange_rates_at_purchase: allExchangeRates,
    pricing_metadata: item.metadata ? {
      metalType: item.metadata.metalType,
      currency: item.metadata.currency,
      weight: item.metadata.weight,
      purity: item.metadata.purity,
    } : null,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    // Rollback order creation
    await supabase.from('orders').delete().eq('id', order.id)
    return { order: null, error: 'Failed to create order items' }
  }

  // Create payment record
  const paymentData: PaymentInsert = {
    order_id: order.id,
    status: 'pending',
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .insert(paymentData)

  if (paymentError) {
    console.error('Payment creation error:', paymentError)
    // Don't fail the order if payment record fails - can be created later
  }

  // Fetch complete order with items
  const { data: completeOrder, error: fetchError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_id,
        quantity,
        price_at_purchase,
        metal_price_usd,
        exchange_rate_myr,
        exchange_rate_inr,
        pricing_metadata,
        product:products (
          id,
          name,
          image
        )
      ),
      payment:payments (
        id,
        status
      )
    `)
    .eq('id', order.id)
    .single()

  if (fetchError || !completeOrder) {
    return { order: null, error: 'Failed to fetch order details' }
  }

  return { order: completeOrder as OrderWithItems, error: null }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string, userId?: string): Promise<OrderWithItems | null> {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_id,
        quantity,
        price_at_purchase,
        metal_price_usd,
        exchange_rate_myr,
        exchange_rate_inr,
        pricing_metadata,
        product:products (
          id,
          name,
          image
        )
      ),
      payment:payments (
        id,
        status,
        verified_by,
        verified_at
      )
    `)
    .eq('id', orderId)

  // If userId provided, ensure user owns the order (for customer access)
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return null
  }

  return data as OrderWithItems
}

/**
 * Get orders for a user
 * Uses service role client for static generation, regular client for runtime
 */
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  // Try to use regular client (for runtime), fall back to service role (for static generation)
  let supabase
  try {
    supabase = await createClient()
  } catch {
    // If cookies() is not available (e.g., in generateStaticParams), use service role client
    supabase = createServiceRoleClient()
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_id,
        quantity,
        price_at_purchase,
        metal_price_usd,
        exchange_rate_myr,
        exchange_rate_inr,
        pricing_metadata,
        product:products (
          id,
          name,
          image
        )
      ),
      payment:payments (
        id,
        status
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data as OrderWithItems[]
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderRow['status']
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  return !error
}

/**
 * Mark payment as pending (customer clicked "I Have Paid")
 */
export async function markPaymentPending(orderId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error: paymentError } = await supabase
    .from('payments')
    .update({ status: 'pending' })
    .eq('order_id', orderId)

  if (paymentError) {
    return false
  }

  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: 'payment_pending' })
    .eq('id', orderId)

  return !orderError
}

/**
 * Verify payment (admin action)
 */
export async function verifyPayment(
  orderId: string,
  verifiedBy: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'verified',
      verified_by: verifiedBy,
      verified_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)

  if (paymentError) {
    return false
  }

  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: 'payment_verified' })
    .eq('id', orderId)

  return !orderError
}

/**
 * Complete order (admin action - after payment verification)
 */
export async function completeOrder(
  orderId: string,
  completedBy: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  return !orderError
}