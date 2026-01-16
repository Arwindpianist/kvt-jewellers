/**
 * Price history database operations
 */

import { createServiceRoleClient } from '@/lib/supabase/server'

export interface PriceHistoryEntry {
  id: string
  price_type: string
  price_value: number
  currency: string
  recorded_at: string
  created_at: string
}

/**
 * Record a price snapshot to history
 */
export async function recordPriceHistory(
  priceType: string,
  priceValue: number,
  currency: string = 'USD'
): Promise<boolean> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('price_history')
    .insert({
      price_type: priceType,
      price_value: priceValue,
      currency,
      recorded_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error recording price history:', error)
    return false
  }

  return true
}

/**
 * Get historical prices for a specific type
 * @param priceType - Type of price (e.g., 'GOLD_USD', 'SILVER_USD')
 * @param days - Number of days of history to retrieve (default: 30)
 * @param limit - Maximum number of records (default: 1000)
 */
export async function getPriceHistory(
  priceType: string,
  days: number = 30,
  limit: number = 1000
): Promise<PriceHistoryEntry[]> {
  const supabase = createServiceRoleClient()

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('price_type', priceType)
    .gte('recorded_at', cutoffDate.toISOString())
    .order('recorded_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching price history:', error)
    return []
  }

  return (data || []) as PriceHistoryEntry[]
}

/**
 * Get historical prices for multiple types
 */
export async function getMultiplePriceHistory(
  priceTypes: string[],
  days: number = 30,
  limit: number = 1000
): Promise<Record<string, PriceHistoryEntry[]>> {
  const supabase = createServiceRoleClient()

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .in('price_type', priceTypes)
    .gte('recorded_at', cutoffDate.toISOString())
    .order('recorded_at', { ascending: true })
    .limit(limit * priceTypes.length)

  if (error) {
    console.error('Error fetching multiple price history:', error)
    return {}
  }

  // Group by price type
  const grouped: Record<string, PriceHistoryEntry[]> = {}
  priceTypes.forEach(type => {
    grouped[type] = []
  })

  ;(data || []).forEach((entry: PriceHistoryEntry) => {
    if (grouped[entry.price_type]) {
      grouped[entry.price_type].push(entry)
    }
  })

  return grouped
}

/**
 * Clean up old price history (keep only last N days)
 */
export async function cleanupOldPriceHistory(keepDays: number = 90): Promise<number> {
  const supabase = createServiceRoleClient()

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - keepDays)

  // First, count records to be deleted
  const { count } = await supabase
    .from('price_history')
    .select('*', { count: 'exact', head: true })
    .lt('recorded_at', cutoffDate.toISOString())

  // Then delete
  const { error } = await supabase
    .from('price_history')
    .delete()
    .lt('recorded_at', cutoffDate.toISOString())

  if (error) {
    console.error('Error cleaning up price history:', error)
    return 0
  }

  return count || 0
}
