import type { GoldPrice, GoldPriceType, ExternalGoldPriceData } from "@/types/gold-prices";
import { 
  fetchGoldPriceUSD, 
  fetchGoldPriceInCurrency, 
  fetchSilverPriceUSD,
  fetchSilverPriceInCurrency,
  ounceToGram 
} from "./gold-price-api";
import { fetchExchangeRates } from "./currency-converter";

// In-memory storage for price overrides and publish status
// In production, this would be in a database
let priceOverrides: Map<string, Partial<GoldPrice>> = new Map();

// Cache for fetched prices
let priceCache: {
  data: GoldPrice[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches gold prices from external API (SERVER-ONLY)
 * This function must NEVER be called from client components
 * Uses gold price in USD and converts to MYR and INR
 */
export async function fetchGoldPricesFromAPI(): Promise<GoldPrice[]> {
  try {
    // Fetch gold and silver prices in USD per ounce using gold-api.com
    const [goldPriceUSDPerOunce, silverPriceUSDPerOunce] = await Promise.all([
      fetchGoldPriceUSD(),
      fetchSilverPriceUSD(),
    ]);
    
    // Convert to per gram for easier calculations
    const goldPriceUSDPerGram = ounceToGram(goldPriceUSDPerOunce);
    const silverPriceUSDPerGram = ounceToGram(silverPriceUSDPerOunce);
    
    // Fetch prices in different currencies
    const [goldPriceMYR, goldPriceINR, silverPriceMYR, silverPriceINR] = await Promise.all([
      fetchGoldPriceInCurrency("MYR"),
      fetchGoldPriceInCurrency("INR"),
      fetchSilverPriceInCurrency("MYR"),
      fetchSilverPriceInCurrency("INR"),
    ]);
    
    // Convert to per gram
    const goldPriceMYRPerGram = ounceToGram(goldPriceMYR);
    const goldPriceINRPerGram = ounceToGram(goldPriceINR);
    const silverPriceMYRPerGram = ounceToGram(silverPriceMYR);
    const silverPriceINRPerGram = ounceToGram(silverPriceINR);
    
    // Fetch exchange rates for currency conversion
    const exchangeRates = await fetchExchangeRates();
    
    // Calculate 916 gold (91.6% pure)
    const gold916MYR = goldPriceMYRPerGram * 0.916;
    const gold916USD = goldPriceUSDPerGram * 0.916;
    const gold916INR = goldPriceINRPerGram * 0.916;
    
    // Create price entries
    const prices: GoldPrice[] = [
      {
        id: "gold-c",
        type: "GOLD_C",
        fetchedPrice: goldPriceMYRPerGram,
        currency: "MYR",
        isPublished: priceOverrides.get("gold-c")?.isPublished ?? true,
        lastUpdated: new Date(),
      },
      {
        id: "gold-usd",
        type: "GOLD_USD",
        fetchedPrice: goldPriceUSDPerGram,
        currency: "USD",
        isPublished: priceOverrides.get("gold-usd")?.isPublished ?? true,
        lastUpdated: new Date(),
      },
      {
        id: "gold-inr",
        type: "GOLD_C",
        fetchedPrice: goldPriceINRPerGram,
        currency: "INR",
        isPublished: priceOverrides.get("gold-inr")?.isPublished ?? true,
        lastUpdated: new Date(),
      },
      {
        id: "silver-c",
        type: "SILVER_C",
        fetchedPrice: silverPriceMYRPerGram,
        currency: "MYR",
        isPublished: priceOverrides.get("silver-c")?.isPublished ?? true,
        lastUpdated: new Date(),
      },
      {
        id: "silver-usd",
        type: "SILVER_USD",
        fetchedPrice: silverPriceUSDPerGram,
        currency: "USD",
        isPublished: priceOverrides.get("silver-usd")?.isPublished ?? true,
        lastUpdated: new Date(),
      },
      {
        id: "sing",
        type: "SING",
        fetchedPrice: gold916MYR,
        currency: "MYR",
        isPublished: priceOverrides.get("sing")?.isPublished ?? true,
        lastUpdated: new Date(),
      },
      {
        id: "myr-usd",
        type: "MYR_USD",
        fetchedPrice: exchangeRates.MYR,
        currency: "USD",
        isPublished: priceOverrides.get("myr-usd")?.isPublished ?? true,
        lastUpdated: new Date(),
      },
      {
        id: "myr-inr",
        type: "MYR_INR",
        fetchedPrice: exchangeRates.INR / exchangeRates.MYR, // MYR to INR rate
        currency: "INR",
        isPublished: priceOverrides.get("myr-inr")?.isPublished ?? true,
        lastUpdated: new Date(),
      },
    ];

    // Apply overrides
    prices.forEach((price) => {
      const override = priceOverrides.get(price.id);
      if (override) {
        if (override.overridePrice !== undefined) {
          price.overridePrice = override.overridePrice;
        }
        if (override.isPublished !== undefined) {
          price.isPublished = override.isPublished;
        }
        if (override.buyPercentage !== undefined) {
          price.buyPercentage = override.buyPercentage;
        }
        if (override.sellPercentage !== undefined) {
          price.sellPercentage = override.sellPercentage;
        }
        if (override.usePresetExchangeRate !== undefined) {
          price.usePresetExchangeRate = override.usePresetExchangeRate;
        }
        if (override.presetExchangeRate !== undefined) {
          price.presetExchangeRate = override.presetExchangeRate;
        }
      }
    });

    // Update cache
    priceCache = {
      data: prices,
      timestamp: Date.now(),
    };

    return prices;
  } catch (error) {
    console.error("Error fetching gold prices:", error);
    
    // Return cached data if available
    if (priceCache.data && Date.now() - priceCache.timestamp < CACHE_DURATION * 2) {
      return priceCache.data;
    }

    // Fallback to mock data
    return getMockGoldPrices();
  }
}

/**
 * Returns mock gold prices for development/testing
 */
function getMockGoldPrices(): GoldPrice[] {
  const now = new Date();
  return [
    {
      id: "gold-c",
      type: "GOLD_C",
      fetchedPrice: 285.50,
      currency: "MYR",
      isPublished: priceOverrides.get("gold-c")?.isPublished ?? true,
      lastUpdated: now,
    },
    {
      id: "gold-usd",
      type: "GOLD_USD",
      fetchedPrice: 68.52,
      currency: "USD",
      isPublished: priceOverrides.get("gold-usd")?.isPublished ?? true,
      lastUpdated: now,
    },
    {
      id: "silver-c",
      type: "SILVER_C",
      fetchedPrice: 3.25,
      currency: "MYR",
      isPublished: priceOverrides.get("silver-c")?.isPublished ?? true,
      lastUpdated: now,
    },
    {
      id: "silver-usd",
      type: "SILVER_USD",
      fetchedPrice: 0.78,
      currency: "USD",
      isPublished: priceOverrides.get("silver-usd")?.isPublished ?? true,
      lastUpdated: now,
    },
    {
      id: "sing",
      type: "SING",
      fetchedPrice: 261.72,
      currency: "MYR",
      isPublished: priceOverrides.get("sing")?.isPublished ?? true,
      lastUpdated: now,
    },
  ];
}

/**
 * Gets cached gold prices (server-only)
 */
export function getCachedGoldPrices(): GoldPrice[] | null {
  if (priceCache.data && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }
  return null;
}

/**
 * Gets only published gold prices (for public consumption)
 */
export function getPublishedGoldPrices(prices: GoldPrice[]): GoldPrice[] {
  return prices.filter((price) => price.isPublished);
}

/**
 * Updates price override (staff only)
 */
export function updatePriceOverride(
  priceId: string,
  override: Partial<GoldPrice>
): void {
  const existing = priceOverrides.get(priceId) || {};
  priceOverrides.set(priceId, { ...existing, ...override });
  
  // Update cache if it exists
  if (priceCache.data) {
    const priceIndex = priceCache.data.findIndex((p) => p.id === priceId);
    if (priceIndex !== -1) {
      priceCache.data[priceIndex] = {
        ...priceCache.data[priceIndex],
        ...override,
      };
    }
  }
}

/**
 * Gets all price overrides (staff only)
 */
export function getPriceOverrides(): Map<string, Partial<GoldPrice>> {
  return priceOverrides;
}

