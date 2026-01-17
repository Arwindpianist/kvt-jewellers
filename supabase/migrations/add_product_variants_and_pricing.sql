-- Add product variants and flexible pricing system
-- This migration adds:
-- 1. pricing_model enum type
-- 2. New columns to products table (pricing_model, base_weight, base_purity, has_variants)
-- 3. product_variants table for variant management
-- 4. Indexes for performance

-- Create pricing_model enum type
DO $$ BEGIN
    CREATE TYPE pricing_model AS ENUM ('fixed', 'dynamic', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS pricing_model pricing_model DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS base_weight NUMERIC,
ADD COLUMN IF NOT EXISTS base_purity TEXT,
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT,
    finish TEXT,
    metal_type TEXT CHECK (metal_type IN ('gold', 'silver', 'platinum', 'palladium')),
    design_style TEXT,
    stone_type TEXT,
    weight NUMERIC,
    additional_price NUMERIC DEFAULT 0 NOT NULL,
    base_price NUMERIC,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Ensure unique combination of options per product
    UNIQUE(product_id, 
           COALESCE(size, ''), 
           COALESCE(finish, ''), 
           COALESCE(metal_type, ''), 
           COALESCE(design_style, ''), 
           COALESCE(stone_type, ''))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(active);
CREATE INDEX IF NOT EXISTS idx_products_pricing_model ON products(pricing_model);
CREATE INDEX IF NOT EXISTS idx_products_has_variants ON products(has_variants);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_product_variants_updated_at ON product_variants;
CREATE TRIGGER trigger_update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_product_variants_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN products.pricing_model IS 'Pricing model: fixed (static price), dynamic (metal-based), hybrid (metal + additional price)';
COMMENT ON COLUMN products.base_weight IS 'Base weight in grams for dynamic/hybrid pricing (used when variant weight not specified)';
COMMENT ON COLUMN products.base_purity IS 'Base purity (e.g., 916) for dynamic/hybrid pricing (used when variant purity not specified)';
COMMENT ON COLUMN products.has_variants IS 'Whether this product has multiple variants';
COMMENT ON COLUMN product_variants.weight IS 'Variant-specific weight in grams (overrides product base_weight)';
COMMENT ON COLUMN product_variants.additional_price IS 'Additional price on top of metal price for hybrid pricing model';
COMMENT ON COLUMN product_variants.base_price IS 'Fixed price for this variant (used when pricing_model is fixed)';
