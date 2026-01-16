/**
 * Gold price API integration
 * Fetches gold prices using metalpriceapi.com (free tier: 100 requests/month)
 * Implements daily caching to limit API calls to 1-2 per day
 * After initial fetch, prices are artificially manipulated for demo purposes
 */

import { convertCurrency } from "./currency-converter";

interface MetalPriceAPIResponse {
  success: boolean;
  base?: string;
  date?: string;
  rates?: {
    XAU?: number; // Gold per ounce
    XAG?: number; // Silver per ounce
    USD?: number;
    MYR?: number;
    INR?: number;
  };
  unit?: string;
  error?: {
    statusCode: number;
    message: string;
  };
}

// Cache for API responses (24 hour duration)
let apiCache: {
  goldPriceUSD: number | null;
  silverPriceUSD: number | null;
  exchangeRates: { MYR: number; INR: number } | null;
  timestamp: number;
} = {
  goldPriceUSD: null,
  silverPriceUSD: null,
  exchangeRates: null,
  timestamp: 0,
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_DAILY_CALLS = 2; // Maximum real API calls per day
let dailyCallCount = 0;
let lastCallDate = new Date().toDateString();

/**
 * Checks if we should make a real API call
 * Limits to MAX_DAILY_CALLS per day
 */
function shouldMakeAPICall(): boolean {
  const today = new Date().toDateString();
  
  // Reset counter if it's a new day
  if (today !== lastCallDate) {
    dailyCallCount = 0;
    lastCallDate = today;
  }
  
  // Check if cache is still valid
  const cacheAge = Date.now() - apiCache.timestamp;
  if (cacheAge < CACHE_DURATION && apiCache.goldPriceUSD !== null) {
    return false; // Use cache
  }
  
  // Check daily call limit
  if (dailyCallCount >= MAX_DAILY_CALLS) {
    console.log(`Daily API call limit reached (${MAX_DAILY_CALLS}). Using cached/manipulated prices.`);
    return false;
  }
  
  return true;
}

/**
 * Fetches gold and silver prices from metalpriceapi.com
 * Returns prices per ounce in USD
 */
async function fetchMetalPricesFromAPI(): Promise<{
  goldUSD: number;
  silverUSD: number;
  exchangeRates: { MYR: number; INR: number };
}> {
  const apiKey = process.env.METAL_PRICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("METAL_PRICE_API_KEY not configured");
  }

  const response = await fetch(
    `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG,MYR,INR`,
    {
      next: { revalidate: 86400 }, // 24 hours cache at Next.js level
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Metal Price API returned ${response.status}: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = (await response.json()) as MetalPriceAPIResponse;
  
  if (!data.success || !data.rates) {
    throw new Error(data.error?.message || "Invalid response from Metal Price API");
  }

  // metalpriceapi.com returns rates as: 1 base currency = X target currency
  // For metals, XAU/XAG are typically returned as ounces per base currency
  // We need to calculate USD per ounce
  // If XAU = 0.0005, that means 1 USD = 0.0005 oz, so 1 oz = 1/0.0005 = 2000 USD
  const goldUSD = data.rates.XAU ? (1 / data.rates.XAU) : 2200; // Fallback
  const silverUSD = data.rates.XAG ? (1 / data.rates.XAG) : 25; // Fallback
  const myrRate = data.rates.MYR || 4.5; // Fallback
  const inrRate = data.rates.INR || 83; // Fallback
  
  // Validate prices are reasonable
  if (goldUSD < 1000 || goldUSD > 5000) {
    console.warn(`Gold price seems invalid: $${goldUSD}/oz, using fallback`);
    return {
      goldUSD: 2200,
      silverUSD: data.rates.XAG ? (1 / data.rates.XAG) : 25,
      exchangeRates: { MYR: myrRate, INR: inrRate },
    };
  }

  return {
    goldUSD,
    silverUSD,
    exchangeRates: {
      MYR: myrRate,
      INR: inrRate,
    },
  };
}

/**
 * Artificially manipulates price for demo purposes
 * Adds small random variations (±0.5% to ±2%)
 */
function manipulatePrice(basePrice: number, variationPercent: number = 1): number {
  const variation = (Math.random() * variationPercent * 2 - variationPercent) / 100;
  return basePrice * (1 + variation);
}

/**
 * Fetches gold price in USD per ounce
 * Uses metalpriceapi.com with daily caching and artificial manipulation
 */
export async function fetchGoldPriceUSD(): Promise<number> {
  try {
    // Check if we should make a real API call
    if (shouldMakeAPICall()) {
      console.log(`Making real API call to metalpriceapi.com (${dailyCallCount + 1}/${MAX_DAILY_CALLS} today)`);
      
      const { goldUSD, exchangeRates } = await fetchMetalPricesFromAPI();
      
      // Update cache
      apiCache = {
        goldPriceUSD: goldUSD,
        silverPriceUSD: null, // Will be fetched if needed
        exchangeRates,
        timestamp: Date.now(),
      };
      
      dailyCallCount++;
      
      return goldUSD;
    }
    
    // Use cached price with artificial manipulation
    if (apiCache.goldPriceUSD !== null) {
      const manipulatedPrice = manipulatePrice(apiCache.goldPriceUSD, 1.5);
      console.log(`Using cached gold price with artificial manipulation: $${manipulatedPrice.toFixed(2)}/oz`);
      return manipulatedPrice;
    }
    
    // Fallback if no cache exists
    console.warn("No cached price available, using fallback");
    return 2200; // Approximate fallback
  } catch (error) {
    console.error("Error fetching gold price in USD:", error);
    
    // Try to use cached price even on error
    if (apiCache.goldPriceUSD !== null) {
      console.log("Using cached price due to API error");
      return manipulatePrice(apiCache.goldPriceUSD, 1.5);
    }
    
    // Final fallback
    return 2200;
  }
}

/**
 * Fetches silver price in USD per ounce
 * Uses metalpriceapi.com with daily caching and artificial manipulation
 */
export async function fetchSilverPriceUSD(): Promise<number> {
  try {
    // Check if we should make a real API call
    if (shouldMakeAPICall() && apiCache.silverPriceUSD === null) {
      console.log(`Fetching silver price from API (${dailyCallCount + 1}/${MAX_DAILY_CALLS} today)`);
      
      const { silverUSD, exchangeRates } = await fetchMetalPricesFromAPI();
      
      // Update cache
      apiCache.silverPriceUSD = silverUSD;
      if (!apiCache.exchangeRates) {
        apiCache.exchangeRates = exchangeRates;
      }
      
      dailyCallCount++;
      
      return silverUSD;
    }
    
    // Use cached price with artificial manipulation
    if (apiCache.silverPriceUSD !== null) {
      const manipulatedPrice = manipulatePrice(apiCache.silverPriceUSD, 1.5);
      console.log(`Using cached silver price with artificial manipulation: $${manipulatedPrice.toFixed(2)}/oz`);
      return manipulatedPrice;
    }
    
    // Fallback if no cache exists
    console.warn("No cached silver price available, using fallback");
    return 25; // Approximate fallback
  } catch (error) {
    console.error("Error fetching silver price in USD:", error);
    
    // Try to use cached price even on error
    if (apiCache.silverPriceUSD !== null) {
      console.log("Using cached silver price due to API error");
      return manipulatePrice(apiCache.silverPriceUSD, 1.5);
    }
    
    // Final fallback
    return 25;
  }
}

/**
 * Gets cached exchange rates or fetches new ones
 */
async function getExchangeRates(): Promise<{ MYR: number; INR: number }> {
  if (apiCache.exchangeRates) {
    return apiCache.exchangeRates;
  }
  
  // If we need to fetch, try to get it from the API
  if (shouldMakeAPICall()) {
    try {
      const { exchangeRates } = await fetchMetalPricesFromAPI();
      apiCache.exchangeRates = exchangeRates;
      return exchangeRates;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  }
  
  // Fallback rates
  return { MYR: 4.5, INR: 83 };
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

  const rates = await getExchangeRates();
  
  if (currency === "MYR") {
    return usdPrice * rates.MYR;
  }
  
  if (currency === "INR") {
    return usdPrice * rates.INR;
  }

  return usdPrice;
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

  const rates = await getExchangeRates();
  
  if (currency === "MYR") {
    return usdPrice * rates.MYR;
  }
  
  if (currency === "INR") {
    return usdPrice * rates.INR;
  }

  return usdPrice;
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
