import type { GoldPrice, GoldPriceType, ExternalGoldPriceData } from "@/types/gold-prices";

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
 */
export async function fetchGoldPricesFromAPI(): Promise<GoldPrice[]> {
  const apiUrl = process.env.GOLD_PRICE_API_URL;
  const apiKey = process.env.GOLD_PRICE_API_KEY;

  // If no API URL configured, return mock data
  if (!apiUrl) {
    return getMockGoldPrices();
  }

  try {
    // Try metals.live API format
    if (apiUrl.includes("metals.live")) {
      const response = await fetch(`${apiUrl}/gold`, {
        headers: apiKey ? { "X-API-Key": apiKey } : {},
        next: { revalidate: 300 }, // 5 minutes
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as ExternalGoldPriceData;
      
      // Transform to our format
      const prices: GoldPrice[] = [
        {
          id: "gold-c",
          type: "GOLD_C",
          fetchedPrice: data.gold || 0,
          currency: "MYR",
          isPublished: priceOverrides.get("gold-c")?.isPublished ?? true,
          lastUpdated: new Date(),
        },
        {
          id: "gold-usd",
          type: "GOLD_USD",
          fetchedPrice: (data.gold || 0) * 0.24, // Approximate USD conversion
          currency: "USD",
          isPublished: priceOverrides.get("gold-usd")?.isPublished ?? true,
          lastUpdated: new Date(),
        },
        {
          id: "silver-c",
          type: "SILVER_C",
          fetchedPrice: data.silver || 0,
          currency: "MYR",
          isPublished: priceOverrides.get("silver-c")?.isPublished ?? true,
          lastUpdated: new Date(),
        },
        {
          id: "silver-usd",
          type: "SILVER_USD",
          fetchedPrice: (data.silver || 0) * 0.24, // Approximate USD conversion
          currency: "USD",
          isPublished: priceOverrides.get("silver-usd")?.isPublished ?? true,
          lastUpdated: new Date(),
        },
        {
          id: "sing",
          type: "SING",
          fetchedPrice: (data.gold || 0) * 0.916, // 916 gold
          currency: "MYR",
          isPublished: priceOverrides.get("sing")?.isPublished ?? true,
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
        }
      });

      // Update cache
      priceCache = {
        data: prices,
        timestamp: Date.now(),
      };

      return prices;
    }

    // Try goldapi.io format
    if (apiUrl.includes("goldapi.io")) {
      const response = await fetch(`${apiUrl}/XAU/MYR`, {
        headers: apiKey ? { "x-access-token": apiKey } : {},
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as { price: number; currency: string };
      
      // Similar transformation as above
      const prices: GoldPrice[] = [
        {
          id: "gold-c",
          type: "GOLD_C",
          fetchedPrice: data.price || 0,
          currency: "MYR",
          isPublished: priceOverrides.get("gold-c")?.isPublished ?? true,
          lastUpdated: new Date(),
        },
        // ... similar for other types
      ];

      // Apply overrides and update cache
      prices.forEach((price) => {
        const override = priceOverrides.get(price.id);
        if (override) {
          if (override.overridePrice !== undefined) {
            price.overridePrice = override.overridePrice;
          }
          if (override.isPublished !== undefined) {
            price.isPublished = override.isPublished;
          }
        }
      });

      priceCache = {
        data: prices,
        timestamp: Date.now(),
      };

      return prices;
    }

    // Fallback: Return mock data if API is not configured
    return getMockGoldPrices();
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

