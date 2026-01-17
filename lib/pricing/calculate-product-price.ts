/**
 * Dynamic product pricing calculation based on metal prices and exchange rates
 */

import { fetchGoldPriceUSD, fetchSilverPriceUSD } from "@/lib/gold-price-api";
import { fetchExchangeRates } from "@/lib/currency-converter";
import { applyPricingMarkups } from "@/lib/pricing/pricing-config";
import type { Product, ProductVariant, PricingModel } from "@/types/products";

export interface PricingMetadata {
  metalType: "gold" | "silver";
  metalPriceUSD: number; // Price per ounce
  exchangeRateMYR: number; // MYR per USD
  exchangeRateINR: number; // INR per USD
  currency: "USD" | "MYR" | "INR";
  weight: number; // Weight in grams
  purity: number; // Purity as decimal (e.g., 0.916 for 916 gold)
  calculatedPrice: number;
  basePrice?: number; // Static product price if available
  additionalPrice?: number; // Additional price for hybrid pricing
  pricingModel?: PricingModel; // Pricing model used
}

/**
 * Calculate variant price based on pricing model
 * 
 * @param product - Product with pricing model configuration
 * @param variant - Product variant (optional, for products with variants)
 * @param currency - Target currency (USD, MYR, or INR)
 * @returns Calculated price and metadata
 */
export async function calculateVariantPrice(
  product: Product,
  variant: ProductVariant | null,
  currency: "USD" | "MYR" | "INR" = "USD"
): Promise<{ price: number; metadata: PricingMetadata }> {
  const pricingModel = product.pricingModel || 'fixed';
  
  // Fixed pricing: use variant basePrice or product price
  if (pricingModel === 'fixed') {
    const fixedPrice = variant?.basePrice || product.price || 0;
    return {
      price: fixedPrice,
      metadata: {
        metalType: "gold",
        metalPriceUSD: 0,
        exchangeRateMYR: 1,
        exchangeRateINR: 1,
        currency,
        weight: 0,
        purity: 0,
        calculatedPrice: fixedPrice,
        basePrice: fixedPrice,
        pricingModel: 'fixed',
      },
    };
  }

  // Dynamic or Hybrid pricing: calculate based on metal price
  const [goldPriceUSD, silverPriceUSD, exchangeRates] = await Promise.all([
    fetchGoldPriceUSD(),
    fetchSilverPriceUSD(),
    fetchExchangeRates(),
  ]);

  // Determine metal type
  let metalType: "gold" | "silver" = "gold";
  const variantMetalType = variant?.metalType || product.metalType;
  
  if (variantMetalType) {
    metalType = variantMetalType === "silver" ? "silver" : "gold";
  } else {
    if (product.category === "silver_bar" || product.category === "silver_coin") {
      metalType = "silver";
    } else if (product.category === "gold_bar" || product.category === "gold_coin") {
      metalType = "gold";
    } else {
      metalType = "gold";
    }
  }

  const metalPriceUSD = metalType === "gold" ? goldPriceUSD : silverPriceUSD;

  // Get weight and purity (prefer variant, fall back to product)
  const weight = variant?.weight || product.baseWeight || product.weight || 0;
  const purityStr = product.basePurity || product.purity || "916";
  const purity = parseFloat(purityStr) / 1000;

  // Calculate base price in USD per gram
  const metalPriceUSDPerGram = metalPriceUSD / 31.1035;
  const basePriceUSD = metalPriceUSDPerGram * weight * purity;

  // Convert to target currency
  let calculatedPrice: number;
  let exchangeRateMYR = exchangeRates.MYR;
  let exchangeRateINR = exchangeRates.INR;

  switch (currency) {
    case "USD":
      calculatedPrice = basePriceUSD;
      break;
    case "MYR":
      calculatedPrice = basePriceUSD * exchangeRateMYR;
      break;
    case "INR":
      calculatedPrice = basePriceUSD * exchangeRateINR;
      break;
    default:
      calculatedPrice = basePriceUSD;
  }

  // For hybrid pricing, add additional price
  if (pricingModel === 'hybrid' && variant) {
    calculatedPrice += (variant.additionalPrice || 0);
  }

  // Apply pricing markups from configuration
  const priceWithMarkups = await applyPricingMarkups(
    calculatedPrice,
    product,
    currency,
    {
      purity: purityStr,
      metalType: variant?.metalType || product.metalType,
      category: product.category,
      hasStones: !!(product.stoneType || product.stoneCount),
      designComplexity: variant?.designStyle || product.designStyle,
    }
  );

  const metadata: PricingMetadata = {
    metalType,
    metalPriceUSD,
    exchangeRateMYR,
    exchangeRateINR,
    currency,
    weight,
    purity,
    calculatedPrice: Math.round(priceWithMarkups * 100) / 100,
    basePrice: product.price,
    additionalPrice: pricingModel === 'hybrid' ? (variant?.additionalPrice || 0) : undefined,
    pricingModel,
  };

  return {
    price: metadata.calculatedPrice,
    metadata,
  };
}

/**
 * Calculate product price based on current metal prices and exchange rates
 * 
 * Formula:
 * - For gold products: (gold_price_usd_per_ounce / 31.1035) * weight_grams * purity * exchange_rate
 * - For silver products: (silver_price_usd_per_ounce / 31.1035) * weight_grams * purity * exchange_rate
 * 
 * @param product - Product to calculate price for
 * @param currency - Target currency (USD, MYR, or INR)
 * @param variant - Optional variant for products with variants
 * @returns Calculated price and metadata
 */
export async function calculateProductPrice(
  product: Product,
  currency: "USD" | "MYR" | "INR" = "USD",
  variant?: ProductVariant | null
): Promise<{ price: number; metadata: PricingMetadata }> {
  // If product has variants, require variant selection
  if (product.hasVariants && !variant) {
    throw new Error("Product has variants. Variant selection is required.");
  }

  // Use new calculateVariantPrice function
  return calculateVariantPrice(product, variant || null, currency);
}

/**
 * Calculate prices for multiple products
 */
export async function calculateProductPrices(
  products: Array<{ product: Product; quantity: number }>,
  currency: "USD" | "MYR" | "INR" = "USD"
): Promise<Array<{ product: Product; quantity: number; price: number; metadata: PricingMetadata }>> {
  // Fetch prices once for all products
  const [goldPriceUSD, silverPriceUSD, exchangeRates] = await Promise.all([
    fetchGoldPriceUSD(),
    fetchSilverPriceUSD(),
    fetchExchangeRates(),
  ]);

  return products.map(({ product, quantity }) => {
    // Determine metal type from product.metalType if available, otherwise infer from category
    let metalType: "gold" | "silver" = "gold";
    
    if (product.metalType) {
      metalType = product.metalType === "silver" ? "silver" : "gold";
    } else {
      if (product.category === "silver_bar" || product.category === "silver_coin") {
        metalType = "silver";
      } else if (product.category === "gold_bar" || product.category === "gold_coin") {
        metalType = "gold";
      } else {
        metalType = "gold";
      }
    }

    const metalPriceUSD = metalType === "gold" ? goldPriceUSD : silverPriceUSD;
    const weight = product.weight || 0;
    const purityStr = product.purity || "916";
    const purity = parseFloat(purityStr) / 1000;

    const metalPriceUSDPerGram = metalPriceUSD / 31.1035;
    const basePriceUSD = metalPriceUSDPerGram * weight * purity;

    let calculatedPrice: number;
    switch (currency) {
      case "USD":
        calculatedPrice = basePriceUSD;
        break;
      case "MYR":
        calculatedPrice = basePriceUSD * exchangeRates.MYR;
        break;
      case "INR":
        calculatedPrice = basePriceUSD * exchangeRates.INR;
        break;
      default:
        calculatedPrice = basePriceUSD;
    }

    const metadata: PricingMetadata = {
      metalType,
      metalPriceUSD,
      exchangeRateMYR: exchangeRates.MYR,
      exchangeRateINR: exchangeRates.INR,
      currency,
      weight,
      purity,
      calculatedPrice: Math.round(calculatedPrice * 100) / 100,
      basePrice: product.price,
    };

    return {
      product,
      quantity,
      price: metadata.calculatedPrice,
      metadata,
    };
  });
}
