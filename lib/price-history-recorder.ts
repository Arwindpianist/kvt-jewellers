/**
 * Records current prices to history database
 * Should be called periodically (e.g., hourly or daily)
 */

import { recordPriceHistory } from "@/lib/db/price-history";
import { fetchGoldPriceUSD, fetchSilverPriceUSD } from "@/lib/gold-price-api";
import { fetchExchangeRates } from "@/lib/currency-converter";

/**
 * Record current prices to history
 * Records: GOLD_USD, SILVER_USD, MYR_USD, MYR_INR
 */
export async function recordCurrentPricesToHistory(): Promise<void> {
  try {
    // Fetch current prices
    const [goldUSD, silverUSD, exchangeRates] = await Promise.all([
      fetchGoldPriceUSD(),
      fetchSilverPriceUSD(),
      fetchExchangeRates(),
    ]);

    // Record prices
    await Promise.all([
      recordPriceHistory("GOLD_USD", goldUSD, "USD"),
      recordPriceHistory("SILVER_USD", silverUSD, "USD"),
      recordPriceHistory("MYR_USD", exchangeRates.MYR, "USD"),
      recordPriceHistory("MYR_INR", exchangeRates.INR / exchangeRates.MYR, "INR"),
    ]);

    console.log("Price history recorded successfully");
  } catch (error) {
    console.error("Error recording price history:", error);
    // Don't throw - this is a background operation
  }
}
