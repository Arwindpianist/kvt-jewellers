/**
 * Pricing configuration helper functions
 * Fetches and applies pricing markups from the database
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Product, ProductCategory, MetalType } from "@/types/products";

export interface PricingConfig {
  purity_markups: Record<string, number>;
  karat_markups: Record<string, number>;
  metal_type_markups: Record<string, number>;
  category_markups: Record<string, number>;
  base_markup: number;
  labor_markup: number;
  stone_markup: number;
  design_complexity_markups: Record<string, number>;
  currency_adjustments: Record<string, number>;
  enabled: boolean;
}

let cachedConfig: PricingConfig | null = null;
let configCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch pricing configuration from database
 */
export async function getPricingConfig(): Promise<PricingConfig | null> {
  // Check cache
  const now = Date.now();
  if (cachedConfig && (now - configCacheTime) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("pricing_configuration")
      .select("*");

    if (error || !data) {
      console.error("Error fetching pricing config:", error);
      return null;
    }

    // Check if configuration is enabled
    const enabledRow = data.find((row) => row.config_key === "enabled");
    if (enabledRow && enabledRow.config_value === false) {
      return null; // Configuration disabled
    }

    // Transform data into config object
    const config: Partial<PricingConfig> = {};
    data.forEach((row) => {
      if (row.config_key !== "enabled") {
        (config as any)[row.config_key] = row.config_value;
      } else {
        config.enabled = row.config_value === true;
      }
    });

    // Set defaults for missing values
    const fullConfig: PricingConfig = {
      purity_markups: config.purity_markups || {},
      karat_markups: config.karat_markups || {},
      metal_type_markups: config.metal_type_markups || {},
      category_markups: config.category_markups || {},
      base_markup: config.base_markup || 0,
      labor_markup: config.labor_markup || 0,
      stone_markup: config.stone_markup || 0,
      design_complexity_markups: config.design_complexity_markups || {},
      currency_adjustments: config.currency_adjustments || { USD: 1.0, MYR: 1.0, INR: 1.0 },
      enabled: config.enabled !== false,
    };

    // Cache the config
    cachedConfig = fullConfig;
    configCacheTime = now;

    return fullConfig;
  } catch (error) {
    console.error("Error fetching pricing config:", error);
    return null;
  }
}

/**
 * Apply pricing markups to a calculated price
 */
export async function applyPricingMarkups(
  basePrice: number,
  product: Product,
  currency: "USD" | "MYR" | "INR",
  metadata?: {
    purity?: string;
    metalType?: MetalType;
    category?: ProductCategory;
    hasStones?: boolean;
    designComplexity?: string;
  }
): Promise<number> {
  const config = await getPricingConfig();

  if (!config || !config.enabled) {
    return basePrice;
  }

  let finalPrice = basePrice;

  // Apply base markup
  if (config.base_markup > 0) {
    finalPrice = finalPrice * (1 + config.base_markup / 100);
  }

  // Apply purity markup
  if (metadata?.purity && config.purity_markups[metadata.purity] !== undefined) {
    const markup = config.purity_markups[metadata.purity];
    if (markup > 0) {
      finalPrice = finalPrice * (1 + markup / 100);
    }
  }

  // Apply metal type markup
  if (metadata?.metalType && config.metal_type_markups[metadata.metalType] !== undefined) {
    const markup = config.metal_type_markups[metadata.metalType];
    if (markup > 0) {
      finalPrice = finalPrice * (1 + markup / 100);
    }
  }

  // Apply category markup
  if (metadata?.category && config.category_markups[metadata.category] !== undefined) {
    const markup = config.category_markups[metadata.category];
    if (markup > 0) {
      finalPrice = finalPrice * (1 + markup / 100);
    }
  }

  // Apply stone markup
  if (metadata?.hasStones && config.stone_markup > 0) {
    finalPrice = finalPrice * (1 + config.stone_markup / 100);
  }

  // Apply design complexity markup
  if (metadata?.designComplexity && config.design_complexity_markups[metadata.designComplexity] !== undefined) {
    const markup = config.design_complexity_markups[metadata.designComplexity];
    if (markup > 0) {
      finalPrice = finalPrice * (1 + markup / 100);
    }
  }

  // Apply currency adjustment
  if (config.currency_adjustments[currency] !== undefined) {
    const adjustment = config.currency_adjustments[currency];
    if (adjustment !== 1.0) {
      finalPrice = finalPrice * adjustment;
    }
  }

  return Math.round(finalPrice * 100) / 100;
}

/**
 * Clear pricing config cache (call after updating configuration)
 */
export function clearPricingConfigCache(): void {
  cachedConfig = null;
  configCacheTime = 0;
}
