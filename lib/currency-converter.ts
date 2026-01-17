/**
 * Currency conversion utilities
 * Fetches exchange rates from API endpoint (which uses database) or falls back to API
 */

interface ExchangeRates {
  USD: number; // Base currency (always 1)
  MYR: number; // Malaysian Ringgit
  INR: number; // Indian Rupee
  timestamp: number;
}

let exchangeRateCache: ExchangeRates | null = null;
const EXCHANGE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetches exchange rates from API endpoint (which queries database)
 * Falls back to external API if needed
 * This function can be called from both client and server components
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  // Check cache first
  if (
    exchangeRateCache &&
    Date.now() - exchangeRateCache.timestamp < EXCHANGE_CACHE_DURATION
  ) {
    return exchangeRateCache;
  }

  try {
    // Fetch from our API endpoint (which uses database)
    const response = await fetch(
      typeof window !== "undefined" 
        ? "/api/exchange-rates" 
        : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/exchange-rates`,
      {
        next: { revalidate: 3600 }, // 1 hour cache
      }
    );

    if (response.ok) {
      const data = await response.json();
      exchangeRateCache = {
        USD: data.USD || 1,
        MYR: data.MYR || 4.7,
        INR: data.INR || 83.0,
        timestamp: data.timestamp || Date.now(),
      };
      return exchangeRateCache;
    }
  } catch (error) {
    // Only log in development to reduce memory usage
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching exchange rates from API:", error);
    }
  }

  // Fallback to external API
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        next: { revalidate: 3600 }, // 1 hour
      }
    );

    if (response.ok) {
      const data = await response.json();
      exchangeRateCache = {
        USD: 1,
        MYR: data.rates.MYR || 4.7,
        INR: data.rates.INR || 83.0,
        timestamp: Date.now(),
      };
      return exchangeRateCache;
    }
  } catch (error) {
    // Only log in development to reduce memory usage
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching exchange rates from external API:", error);
    }
  }

  // Return cached data if available
  if (exchangeRateCache) {
    return exchangeRateCache;
  }

  // Final fallback to approximate rates
  exchangeRateCache = {
    USD: 1,
    MYR: 4.7,
    INR: 83.0,
    timestamp: Date.now(),
  };
  return exchangeRateCache;
}

/**
 * Converts price from USD to target currency
 */
export async function convertCurrency(
  usdPrice: number,
  targetCurrency: "USD" | "MYR" | "INR"
): Promise<number> {
  if (targetCurrency === "USD") {
    return usdPrice;
  }

  const rates = await fetchExchangeRates();
  return usdPrice * rates[targetCurrency];
}

/**
 * Converts price from any currency to USD
 */
export async function convertToUSD(
  price: number,
  fromCurrency: "USD" | "MYR" | "INR"
): Promise<number> {
  if (fromCurrency === "USD") {
    return price;
  }

  const rates = await fetchExchangeRates();
  return price / rates[fromCurrency];
}
