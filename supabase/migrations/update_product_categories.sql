-- Update product_category enum with comprehensive categories
-- First, drop the old enum and create a new one
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_fkey;

-- Create new comprehensive enum
DO $$ BEGIN
    CREATE TYPE product_category_new AS ENUM (
        -- Investment Products
        'gold_bar',
        'silver_bar',
        'gold_coin',
        'silver_coin',
        -- Jewelry - Necklaces & Chains
        'necklace',
        'chain',
        'pendant',
        'choker',
        -- Jewelry - Bangles & Bracelets
        'bangle',
        'bracelet',
        'charm_bracelet',
        -- Jewelry - Rings
        'ring',
        'engagement_ring',
        'wedding_ring',
        -- Jewelry - Earrings
        'earring',
        'stud_earring',
        'hoop_earring',
        'drop_earring',
        -- Other Jewelry
        'anklet',
        'toe_ring',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns for additional product attributes
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS metal_type TEXT CHECK (metal_type IN ('gold', 'silver', 'platinum', 'palladium')),
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS stone_type TEXT,
ADD COLUMN IF NOT EXISTS stone_count INTEGER,
ADD COLUMN IF NOT EXISTS design_style TEXT,
ADD COLUMN IF NOT EXISTS finish TEXT;

-- Migrate existing data
UPDATE products SET category = 'gold_bar' WHERE category = 'bar';
UPDATE products SET category = 'gold_coin' WHERE category = 'coin';
UPDATE products SET category = 'necklace' WHERE category = 'jewellery' AND name ILIKE '%necklace%';
UPDATE products SET category = 'ring' WHERE category = 'jewellery' AND name ILIKE '%ring%';
UPDATE products SET category = 'bangle' WHERE category = 'jewellery' AND name ILIKE '%bangle%';
UPDATE products SET category = 'bracelet' WHERE category = 'jewellery' AND name ILIKE '%bracelet%';
UPDATE products SET category = 'other' WHERE category = 'jewellery';

-- Change column type
ALTER TABLE products ALTER COLUMN category TYPE product_category_new USING category::text::product_category_new;

-- Drop old enum
DROP TYPE IF EXISTS product_category;

-- Rename new enum
ALTER TYPE product_category_new RENAME TO product_category;

-- Add comment
COMMENT ON COLUMN products.metal_type IS 'Type of metal: gold, silver, platinum, or palladium';
COMMENT ON COLUMN products.size IS 'Size information (e.g., ring size, chain length, etc.)';
COMMENT ON COLUMN products.dimensions IS 'Physical dimensions (e.g., length x width x height)';
COMMENT ON COLUMN products.stone_type IS 'Type of gemstone if applicable';
COMMENT ON COLUMN products.stone_count IS 'Number of stones';
COMMENT ON COLUMN products.design_style IS 'Design style (e.g., classic, modern, vintage, etc.)';
COMMENT ON COLUMN products.finish IS 'Surface finish (e.g., polished, matte, brushed, hammered)';
