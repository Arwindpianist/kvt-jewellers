-- Add comprehensive purchase analytics columns to order_items table
-- This captures all price data at the time of purchase for business analytics

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS gold_price_usd_at_purchase NUMERIC,
ADD COLUMN IF NOT EXISTS silver_price_usd_at_purchase NUMERIC,
ADD COLUMN IF NOT EXISTS exchange_rate_myr_usd_at_purchase NUMERIC,
ADD COLUMN IF NOT EXISTS exchange_rate_inr_usd_at_purchase NUMERIC,
ADD COLUMN IF NOT EXISTS price_history_snapshot JSONB,
ADD COLUMN IF NOT EXISTS all_metal_prices_at_purchase JSONB,
ADD COLUMN IF NOT EXISTS all_exchange_rates_at_purchase JSONB;

-- Add comment explaining the analytics columns
COMMENT ON COLUMN order_items.gold_price_usd_at_purchase IS 'Gold price per ounce in USD at time of purchase';
COMMENT ON COLUMN order_items.silver_price_usd_at_purchase IS 'Silver price per ounce in USD at time of purchase';
COMMENT ON COLUMN order_items.exchange_rate_myr_usd_at_purchase IS 'MYR/USD exchange rate at time of purchase';
COMMENT ON COLUMN order_items.exchange_rate_inr_usd_at_purchase IS 'INR/USD exchange rate at time of purchase';
COMMENT ON COLUMN order_items.price_history_snapshot IS 'Snapshot of price_history table at time of purchase (last 3 records per price type)';
COMMENT ON COLUMN order_items.all_metal_prices_at_purchase IS 'All metal prices (gold, silver) in all currencies at time of purchase';
COMMENT ON COLUMN order_items.all_exchange_rates_at_purchase IS 'All exchange rates (MYR/USD, INR/USD, MYR/INR) at time of purchase';

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_order_items_purchase_timestamp ON order_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product_analytics ON order_items(product_id, created_at DESC);
