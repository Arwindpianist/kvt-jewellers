import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { Product, ProductCategory } from '@/types/products'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

/**
 * Convert database product row to Product type
 */
function dbProductToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ProductCategory,
    description: row.description || '',
    images: row.image ? [row.image] : [],
    price: Number(row.price),
    weight: row.weight ? Number(row.weight) : undefined,
    purity: row.purity || undefined,
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

  return (data || []).map(dbProductToProduct)
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

  return (data || []).map(dbProductToProduct)
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

  return (data || []).map(dbProductToProduct)
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
  
  const insertData: ProductInsert = {
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price || 0,
    image: product.images?.[0] || null,
    active: true,
    weight: product.weight || null,
    purity: product.purity || null,
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
  
  const updateData: ProductUpdate = {}
  
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.category !== undefined) updateData.category = updates.category as ProductUpdate['category']
  if (updates.price !== undefined) updateData.price = updates.price
  if (updates.images !== undefined) updateData.image = updates.images[0] || null
  if (updates.weight !== undefined) updateData.weight = updates.weight || null
  if (updates.purity !== undefined) updateData.purity = updates.purity || null
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