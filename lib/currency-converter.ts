/**
 * Currency conversion utilities
 * Fetches exchange rates and converts between USD, MYR, and INR
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
 * Fetches current exchange rates (USD base)
 * Uses exchangerate-api.com free tier
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
    // Using exchangerate-api.com free tier (no API key required for basic usage)
    // Alternative: Use fixer.io, currencyapi.net, or exchangerate.host
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        next: { revalidate: 3600 }, // 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`);
    }

    const data = await response.json();

    exchangeRateCache = {
      USD: 1,
      MYR: data.rates.MYR || 4.7, // Fallback rate
      INR: data.rates.INR || 83.0, // Fallback rate
      timestamp: Date.now(),
    };

    return exchangeRateCache;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

    // Return cached data if available
    if (exchangeRateCache) {
      return exchangeRateCache;
    }

    // Fallback to approximate rates
    return {
      USD: 1,
      MYR: 4.7, // Approximate MYR/USD rate
      INR: 83.0, // Approximate INR/USD rate
      timestamp: Date.now(),
    };
  }
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

