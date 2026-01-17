import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { Product, ProductCategory, ProductVariant, PricingModel } from '@/types/products'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

/**
 * Convert database variant row to ProductVariant type
 */
function dbVariantToVariant(row: any): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    size: row.size || undefined,
    finish: row.finish || undefined,
    metalType: row.metal_type || undefined,
    designStyle: row.design_style || undefined,
    stoneType: row.stone_type || undefined,
    weight: row.weight ? Number(row.weight) : undefined,
    additionalPrice: Number(row.additional_price || 0),
    basePrice: row.base_price ? Number(row.base_price) : undefined,
    active: row.active !== false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Convert database product row to Product type
 */
export function dbProductToProduct(row: ProductRow, includeVariants: boolean = false): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ProductCategory,
    description: row.description || '',
    images: row.image ? [row.image] : [],
    price: Number(row.price),
    weight: row.weight ? Number(row.weight) : undefined,
    purity: row.purity || undefined,
    metalType: (row as any).metal_type as any || undefined,
    size: (row as any).size || undefined,
    dimensions: (row as any).dimensions || undefined,
    stoneType: (row as any).stone_type || undefined,
    stoneCount: (row as any).stone_count ? Number((row as any).stone_count) : undefined,
    designStyle: (row as any).design_style || undefined,
    finish: (row as any).finish || undefined,
    pricingModel: ((row as any).pricing_model || 'fixed') as PricingModel,
    baseWeight: (row as any).base_weight ? Number((row as any).base_weight) : undefined,
    basePurity: (row as any).base_purity || undefined,
    hasVariants: (row as any).has_variants === true,
    variants: includeVariants ? undefined : undefined, // Will be populated separately if needed
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Gets all active products
 * Uses service role client for static generation, regular client for runtime
 */
export async function getAllProducts(): Promise<Product[]> {
  // Try to use regular client (for runtime), fall back to service role (for static generation)
  let supabase
  try {
    supabase = await createClient()
  } catch {
    // If cookies() is not available (e.g., in generateStaticParams), use service role client
    supabase = createServiceRoleClient()
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data || []).map((row) => dbProductToProduct(row, false))
}

/**
 * Gets all products (including inactive) - for admin
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data || []).map((row) => dbProductToProduct(row, false))
}

/**
 * Gets products by category
 */
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }

  return (data || []).map((row) => dbProductToProduct(row, false))
}

/**
 * Gets a product by ID
 * Uses service role client for static generation, regular client for runtime
 */
export async function getProductById(id: string): Promise<Product | null> {
  // Try to use regular client (for runtime), fall back to service role (for static generation)
  let supabase
  try {
    supabase = await createClient()
  } catch {
    // If cookies() is not available (e.g., in generateMetadata), use service role client
    supabase = createServiceRoleClient()
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return dbProductToProduct(data)
}

/**
 * Creates a new product (admin only)
 */
export async function createProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product | null> {
  const supabase = await createClient()
  
  const insertData: ProductInsert & any = {
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price || 0,
    image: product.images?.[0] || null,
    active: true,
    weight: product.weight || null,
    purity: product.purity || null,
    metal_type: product.metalType || null,
    size: product.size || null,
    dimensions: product.dimensions || null,
    stone_type: product.stoneType || null,
    stone_count: product.stoneCount || null,
    design_style: product.designStyle || null,
    finish: product.finish || null,
    pricing_model: product.pricingModel || 'fixed',
    base_weight: product.baseWeight || null,
    base_purity: product.basePurity || null,
    has_variants: product.hasVariants || false,
  }

  const { data, error } = await supabase
    .from('products')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return null
  }

  return dbProductToProduct(data)
}

/**
 * Updates a product (admin only)
 */
export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const supabase = await createClient()
  
  const updateData: ProductUpdate & any = {}
  
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.category !== undefined) updateData.category = updates.category as ProductUpdate['category']
  if (updates.price !== undefined) updateData.price = updates.price
  if (updates.images !== undefined) updateData.image = updates.images[0] || null
  if (updates.weight !== undefined) updateData.weight = updates.weight || null
  if (updates.purity !== undefined) updateData.purity = updates.purity || null
  if (updates.metalType !== undefined) updateData.metal_type = updates.metalType || null
  if (updates.size !== undefined) updateData.size = updates.size || null
  if (updates.dimensions !== undefined) updateData.dimensions = updates.dimensions || null
  if (updates.stoneType !== undefined) updateData.stone_type = updates.stoneType || null
  if (updates.stoneCount !== undefined) updateData.stone_count = updates.stoneCount || null
  if (updates.designStyle !== undefined) updateData.design_style = updates.designStyle || null
  if (updates.finish !== undefined) updateData.finish = updates.finish || null
  if (updates.pricingModel !== undefined) updateData.pricing_model = updates.pricingModel as any
  if (updates.baseWeight !== undefined) updateData.base_weight = updates.baseWeight || null
  if (updates.basePurity !== undefined) updateData.base_purity = updates.basePurity || null
  if (updates.hasVariants !== undefined) updateData.has_variants = updates.hasVariants
  // Note: active field can be updated separately

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return null
  }

  return dbProductToProduct(data)
}

/**
 * Updates product active status (admin only)
 */
export async function updateProductActive(
  id: string,
  active: boolean
): Promise<Product | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .update({ active })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product active status:', error)
    return null
  }

  return dbProductToProduct(data)
}

/**
 * Deletes a product (admin only)
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return false
  }

  return true
}

/**
 * Gets all variants for a product
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching product variants:', error)
    return []
  }

  return (data || []).map(dbVariantToVariant)
}

/**
 * Gets a specific variant by option combination
 */
export async function getProductVariant(
  productId: string,
  options: {
    size?: string;
    finish?: string;
    metalType?: string;
    designStyle?: string;
    stoneType?: string;
  }
): Promise<ProductVariant | null> {
  const supabase = await createClient()
  
  let query = supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('active', true)

  if (options.size !== undefined) {
    query = query.eq('size', options.size)
  } else {
    query = query.is('size', null)
  }
  
  if (options.finish !== undefined) {
    query = query.eq('finish', options.finish)
  } else {
    query = query.is('finish', null)
  }
  
  if (options.metalType !== undefined) {
    query = query.eq('metal_type', options.metalType)
  } else {
    query = query.is('metal_type', null)
  }
  
  if (options.designStyle !== undefined) {
    query = query.eq('design_style', options.designStyle)
  } else {
    query = query.is('design_style', null)
  }
  
  if (options.stoneType !== undefined) {
    query = query.eq('stone_type', options.stoneType)
  } else {
    query = query.is('stone_type', null)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return null
  }

  return dbVariantToVariant(data)
}

/**
 * Creates a new product variant (admin only)
 */
export async function createProductVariant(
  variant: Omit<ProductVariant, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProductVariant | null> {
  const supabase = await createClient()
  
  const insertData: any = {
    product_id: variant.productId,
    size: variant.size || null,
    finish: variant.finish || null,
    metal_type: variant.metalType || null,
    design_style: variant.designStyle || null,
    stone_type: variant.stoneType || null,
    weight: variant.weight || null,
    additional_price: variant.additionalPrice || 0,
    base_price: variant.basePrice || null,
    active: variant.active !== false,
  }

  const { data, error } = await supabase
    .from('product_variants')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating product variant:', error)
    return null
  }

  return dbVariantToVariant(data)
}

/**
 * Updates a product variant (admin only)
 */
export async function updateProductVariant(
  id: string,
  updates: Partial<ProductVariant>
): Promise<ProductVariant | null> {
  const supabase = await createClient()
  
  const updateData: any = {}
  
  if (updates.size !== undefined) updateData.size = updates.size || null
  if (updates.finish !== undefined) updateData.finish = updates.finish || null
  if (updates.metalType !== undefined) updateData.metal_type = updates.metalType || null
  if (updates.designStyle !== undefined) updateData.design_style = updates.designStyle || null
  if (updates.stoneType !== undefined) updateData.stone_type = updates.stoneType || null
  if (updates.weight !== undefined) updateData.weight = updates.weight || null
  if (updates.additionalPrice !== undefined) updateData.additional_price = updates.additionalPrice
  if (updates.basePrice !== undefined) updateData.base_price = updates.basePrice || null
  if (updates.active !== undefined) updateData.active = updates.active

  const { data, error } = await supabase
    .from('product_variants')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product variant:', error)
    return null
  }

  return dbVariantToVariant(data)
}

/**
 * Deletes a product variant (admin only)
 */
export async function deleteProductVariant(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product variant:', error)
    return false
  }

  return true
}