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
 * Automatically keeps only the 3 most recent records per price_type
 * (With separate _24H price_types, this results in 3 current + 3 historical per base type)
 */
export async function recordPriceHistory(
  priceType: string,
  priceValue: number,
  currency: string = 'USD',
  recordedAt?: Date
): Promise<boolean> {
  const supabase = createServiceRoleClient()

  // Insert new record
  const { error: insertError } = await supabase
    .from('price_history')
    .insert({
      price_type: priceType,
      price_value: priceValue,
      currency,
      recorded_at: recordedAt ? recordedAt.toISOString() : new Date().toISOString(),
    })

  if (insertError) {
    console.error('Error recording price history:', insertError)
    return false
  }

  // Automatically cleanup to keep only 3 most recent records per price_type
  // This is non-blocking - cleanup happens in background
  cleanupOldPriceHistoryByLimit(priceType, 3).catch(err => 
    console.error(`Failed to cleanup price history for ${priceType}:`, err)
  )

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
 * Clean up old price history for a specific price_type, keeping only the N most recent records
 * @param priceType - Type of price (e.g., 'GOLD_USD', 'SILVER_USD')
 * @param keepCount - Number of most recent records to keep (default: 3)
 */
export async function cleanupOldPriceHistoryByLimit(
  priceType: string,
  keepCount: number = 3
): Promise<number> {
  const supabase = createServiceRoleClient()

  // Get all records for this price_type, ordered by recorded_at descending
  const { data: allRecords, error: fetchError } = await supabase
    .from('price_history')
    .select('id')
    .eq('price_type', priceType)
    .order('recorded_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching price history for cleanup:', fetchError)
    return 0
  }

  if (!allRecords || allRecords.length <= keepCount) {
    // No cleanup needed
    return 0
  }

  // Get IDs of records to delete (everything beyond the keepCount most recent)
  const recordsToDelete = allRecords.slice(keepCount).map(r => r.id)

  // Delete old records
  const { error: deleteError } = await supabase
    .from('price_history')
    .delete()
    .in('id', recordsToDelete)

  if (deleteError) {
    console.error('Error deleting old price history:', deleteError)
    return 0
  }

  return recordsToDelete.length
}

/**
 * Clean up old price history for all price_types, keeping only the N most recent records per type
 * Uses database function for efficient cleanup
 * @param keepCount - Number of most recent records to keep per price_type (default: 3)
 * Note: With separate price_types for current and 24H, this results in 3 current + 3 historical per base type
 */
export async function cleanupAllPriceHistoryByLimit(
  keepCount: number = 3
): Promise<Record<string, number>> {
  const supabase = createServiceRoleClient()

  // Use database function for efficient cleanup
  const { data, error } = await supabase.rpc('cleanup_all_price_history', {
    keep_count: keepCount
  })

  if (error) {
    console.error('Error cleaning up price history via database function:', error)
    // Fallback to application-level cleanup if database function fails
    return await cleanupAllPriceHistoryByLimitFallback(keepCount)
  }

  // Convert array result to Record format
  const results: Record<string, number> = {}
  if (data && Array.isArray(data)) {
    data.forEach((row: { price_type_result: string; deleted_count: number }) => {
      results[row.price_type_result] = Number(row.deleted_count)
    })
  }

  return results
}

/**
 * Fallback cleanup method (application-level)
 * Used if database function is unavailable
 */
async function cleanupAllPriceHistoryByLimitFallback(
  keepCount: number = 3
): Promise<Record<string, number>> {
  const supabase = createServiceRoleClient()

  // Get all unique price_types
  const { data: priceTypes, error: typesError } = await supabase
    .from('price_history')
    .select('price_type')
    .order('price_type')

  if (typesError || !priceTypes) {
    console.error('Error fetching price types:', typesError)
    return {}
  }

  // Get unique price types
  const uniqueTypes = [...new Set(priceTypes.map(p => p.price_type))]
  const results: Record<string, number> = {}

  // Clean up each price type
  for (const priceType of uniqueTypes) {
    const deletedCount = await cleanupOldPriceHistoryByLimit(priceType, keepCount)
    results[priceType] = deletedCount
  }

  return results
}

/**
 * Clean up old price history (keep only last N days)
 * @deprecated Use cleanupOldPriceHistoryByLimit instead
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
