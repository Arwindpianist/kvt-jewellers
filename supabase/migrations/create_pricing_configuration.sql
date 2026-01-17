-- Create pricing configuration table for markups and settings
-- This allows admins to configure purity markups, karat markups, and other pricing settings

CREATE TABLE IF NOT EXISTS pricing_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pricing_config_key ON pricing_configuration(config_key);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pricing_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_pricing_config_updated_at ON pricing_configuration;
CREATE TRIGGER trigger_update_pricing_config_updated_at
    BEFORE UPDATE ON pricing_configuration
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_config_updated_at();

-- Insert default configuration
INSERT INTO pricing_configuration (config_key, config_value, description)
VALUES 
    ('purity_markups', '{"750": 0, "916": 0, "999": 0, "999.9": 0}'::jsonb, 'Markup percentages for different purity levels (e.g., 750, 916, 999, 999.9)'),
    ('karat_markups', '{"18k": 0, "22k": 0, "24k": 0}'::jsonb, 'Markup percentages for different karat values'),
    ('metal_type_markups', '{"gold": 0, "silver": 0, "platinum": 0, "palladium": 0}'::jsonb, 'Markup percentages for different metal types'),
    ('category_markups', '{}'::jsonb, 'Markup percentages for different product categories'),
    ('base_markup', '0'::jsonb, 'Base markup percentage applied to all products'),
    ('labor_markup', '0'::jsonb, 'Default labor/making charge markup percentage'),
    ('stone_markup', '0'::jsonb, 'Markup percentage for products with stones'),
    ('design_complexity_markups', '{"simple": 0, "moderate": 0, "complex": 0, "intricate": 0}'::jsonb, 'Markup percentages based on design complexity'),
    ('currency_adjustments', '{"USD": 1.0, "MYR": 1.0, "INR": 1.0}'::jsonb, 'Currency adjustment multipliers'),
    ('enabled', 'true'::jsonb, 'Whether pricing configuration is enabled')
ON CONFLICT (config_key) DO NOTHING;

-- Add comments
COMMENT ON TABLE pricing_configuration IS 'Master pricing configuration for markups and adjustments';
COMMENT ON COLUMN pricing_configuration.config_key IS 'Unique key identifying the configuration setting';
COMMENT ON COLUMN pricing_configuration.config_value IS 'JSON value containing the configuration data';
COMMENT ON COLUMN pricing_configuration.description IS 'Human-readable description of what this configuration controls';
