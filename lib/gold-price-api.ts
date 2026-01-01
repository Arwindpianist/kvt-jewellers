/**
 * Gold price API integration
 * Fetches gold prices in USD per ounce using gold-api.com (free, no authentication)
 * Then converts to other currencies (MYR, INR)
 */

import { convertCurrency } from "./currency-converter";

interface GoldAPIResponse {
  name: string;
  price: number; // Price per ounce in USD
  symbol: string;
  updatedAt: string;
  updatedAtReadable: string;
}

/**
 * Fetches gold price in USD per ounce
 * Uses gold-api.com (free, no authentication required)
 */
export async function fetchGoldPriceUSD(): Promise<number> {
  try {
    // Using gold-api.com - free endpoint with no rate limits
    const response = await fetch(
      "https://api.gold-api.com/price/XAU",
      {
        next: { revalidate: 300 }, // 5 minutes cache
      }
    );

    if (!response.ok) {
      throw new Error(`Gold API returned ${response.status}`);
    }

    const data = (await response.json()) as GoldAPIResponse;
    
    if (data.price && data.price > 0) {
      return data.price; // Price per ounce in USD
    }

    throw new Error("Invalid price data from API");
  } catch (error) {
    console.error("Error fetching gold price in USD:", error);
    
    // Fallback: Use approximate current gold price
    // As of 2024-2025, gold is typically around $2000-2500 per ounce
    return 2200; // Approximate fallback
  }
}

/**
 * Fetches silver price in USD per ounce
 * Uses gold-api.com (free, no authentication required)
 */
export async function fetchSilverPriceUSD(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.gold-api.com/price/XAG",
      {
        next: { revalidate: 300 }, // 5 minutes cache
      }
    );

    if (!response.ok) {
      throw new Error(`Gold API returned ${response.status}`);
    }

    const data = (await response.json()) as GoldAPIResponse;
    
    if (data.price && data.price > 0) {
      return data.price; // Price per ounce in USD
    }

    throw new Error("Invalid price data from API");
  } catch (error) {
    console.error("Error fetching silver price in USD:", error);
    
    // Fallback: Approximate silver price (typically $20-30 per ounce)
    return 25; // Approximate fallback
  }
}

/**
 * Fetches gold price in a specific currency
 */
export async function fetchGoldPriceInCurrency(
  currency: "USD" | "MYR" | "INR"
): Promise<number> {
  const usdPrice = await fetchGoldPriceUSD();

  if (currency === "USD") {
    return usdPrice;
  }

  return await convertCurrency(usdPrice, currency);
}

/**
 * Fetches silver price in a specific currency
 */
export async function fetchSilverPriceInCurrency(
  currency: "USD" | "MYR" | "INR"
): Promise<number> {
  const usdPrice = await fetchSilverPriceUSD();

  if (currency === "USD") {
    return usdPrice;
  }

  return await convertCurrency(usdPrice, currency);
}

/**
 * Converts gold price per ounce to per gram
 */
export function ounceToGram(pricePerOunce: number): number {
  // 1 ounce = 31.1035 grams
  return pricePerOunce / 31.1035;
}

/**
 * Converts gold price per gram to per ounce
 */
export function gramToOunce(pricePerGram: number): number {
  // 1 ounce = 31.1035 grams
  return pricePerGram * 31.1035;
}
