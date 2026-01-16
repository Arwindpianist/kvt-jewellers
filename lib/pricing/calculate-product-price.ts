/**
 * Dynamic product pricing calculation based on metal prices and exchange rates
 */

import { fetchGoldPriceUSD, fetchSilverPriceUSD } from "@/lib/gold-price-api";
import { fetchExchangeRates } from "@/lib/currency-converter";
import type { Product } from "@/types/products";

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
 * @returns Calculated price and metadata
 */
export async function calculateProductPrice(
  product: Product,
  currency: "USD" | "MYR" | "INR" = "USD"
): Promise<{ price: number; metadata: PricingMetadata }> {
  // Fetch current metal prices and exchange rates
  const [goldPriceUSD, silverPriceUSD, exchangeRates] = await Promise.all([
    fetchGoldPriceUSD(),
    fetchSilverPriceUSD(),
    fetchExchangeRates(),
  ]);

  // Determine metal type based on product category
  // For now, assume all products are gold (can be enhanced later)
  const metalType: "gold" | "silver" = product.category === "bar" || product.category === "coin" 
    ? "gold" // Bars and coins are typically gold
    : "gold"; // Default to gold for jewelry

  const metalPriceUSD = metalType === "gold" ? goldPriceUSD : silverPriceUSD;

  // Get product weight and purity
  const weight = product.weight || 0; // Weight in grams
  const purityStr = product.purity || "916"; // Default to 916 gold
  const purity = parseFloat(purityStr) / 1000; // Convert "916" to 0.916

  // Calculate base price in USD per gram
  // 1 troy ounce = 31.1035 grams
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

  const metadata: PricingMetadata = {
    metalType,
    metalPriceUSD,
    exchangeRateMYR,
    exchangeRateINR,
    currency,
    weight,
    purity,
    calculatedPrice,
    basePrice: product.price,
  };

  return {
    price: Math.round(calculatedPrice * 100) / 100, // Round to 2 decimal places
    metadata,
  };
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
    const metalType: "gold" | "silver" = product.category === "bar" || product.category === "coin" 
      ? "gold"
      : "gold";

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
