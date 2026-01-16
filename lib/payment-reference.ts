/**
 * Generate a unique payment reference code
 * Format: KVT-YYYYMMDD-XXXXX (e.g., KVT-20240115-A3B2C)
 */
export function generatePaymentReference(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `KVT-${dateStr}-${randomStr}`;
}