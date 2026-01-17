/**
 * Records current prices to history database
 * Should be called periodically (e.g., hourly or daily)
 * Records both current prices and 24h ago prices (if available)
 * Respects 2 API calls per day limit
 * 
 * Note: This function makes API calls (respects 2/day limit)
 * For automatic 24h history recording without API calls, use ensure24hHistoryRecorded()
 */

import { recordPriceHistory, getPriceHistory } from "@/lib/db/price-history";
import { fetchGoldPriceUSD, fetchSilverPriceUSD } from "@/lib/gold-price-api";
import { fetchExchangeRates } from "@/lib/currency-converter";
import { ensure24hHistoryRecorded } from "@/lib/ensure-24h-history";

/**
 * Record current prices to history
 * Also records 24h ago prices from existing history (if available)
 * Records: GOLD_USD, SILVER_USD, MYR_USD, MYR_INR
 */
export async function recordCurrentPricesToHistory(): Promise<void> {
  try {
    // Fetch current prices (respects 2 calls/day limit)
    const [goldUSD, silverUSD, exchangeRates] = await Promise.all([
      fetchGoldPriceUSD(),
      fetchSilverPriceUSD(),
      fetchExchangeRates(),
    ]);

    // Get 24h ago prices from existing history
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [goldHistory, silverHistory, myrUsdHistory, myrInrHistory] = await Promise.all([
      getPriceHistory("GOLD_USD", 2, 10), // Get last 2 days, max 10 records
      getPriceHistory("SILVER_USD", 2, 10),
      getPriceHistory("MYR_USD", 2, 10),
      getPriceHistory("MYR_INR", 2, 10),
    ]);

    // Find price closest to 24 hours ago
    const findPrice24hAgo = (history: any[]) => {
      if (!history || history.length === 0) return null;
      
      // Sort by recorded_at descending (most recent first)
      const sorted = [...history].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );

      // Find the record closest to 24 hours ago
      let closest = sorted[0];
      let closestDiff = Math.abs(
        new Date(closest.recorded_at).getTime() - twentyFourHoursAgo.getTime()
      );

      for (const record of sorted) {
        const recordTime = new Date(record.recorded_at).getTime();
        const diff = Math.abs(recordTime - twentyFourHoursAgo.getTime());
        if (diff < closestDiff) {
          closestDiff = diff;
          closest = record;
        }
      }

      // Accept records between 18-30 hours ago
      const hoursDiff = closestDiff / (60 * 60 * 1000);
      if (hoursDiff >= 18 && hoursDiff <= 30) {
        return closest.price_value;
      }
      
      // If no record in that range, try to find the oldest record (at least 12 hours old)
      const oldestRecord = sorted[sorted.length - 1];
      if (oldestRecord) {
        const oldestTime = new Date(oldestRecord.recorded_at).getTime();
        const oldestHoursDiff = (Date.now() - oldestTime) / (60 * 60 * 1000);
        if (oldestHoursDiff >= 12) {
          return oldestRecord.price_value;
        }
      }
      
      return null;
    };

    const gold24hAgo = findPrice24hAgo(goldHistory);
    const silver24hAgo = findPrice24hAgo(silverHistory);
    const myrUsd24hAgo = findPrice24hAgo(myrUsdHistory);
    const myrInr24hAgo = findPrice24hAgo(myrInrHistory);

    // Normalize prices to per ounce (ensure consistency)
    // Gold per ounce is typically $2000-$3000, per gram is $60-$100
    // Silver per ounce is typically $20-$40, per gram is $0.60-$1.30
    const normalizePrice = (price: number, priceType: string, currentPrice?: number): number => {
      if (priceType === "GOLD_USD") {
        // If price is suspiciously low (< $500), likely per gram
        // Or if current price exists and ratio is > 10x, likely unit mismatch
        if (price < 500) {
          return price * 31.1035;
        }
        if (currentPrice && currentPrice > 0) {
          const ratio = currentPrice / price;
          if (ratio > 10 || ratio < 0.1) {
            // Suspicious ratio suggests unit mismatch
            if (price < 2000) {
              return price * 31.1035;
            }
          }
        }
      } else if (priceType === "SILVER_USD") {
        // If price is suspiciously low (< $5), likely per gram
        if (price < 5) {
          return price * 31.1035;
        }
        if (currentPrice && currentPrice > 0) {
          const ratio = currentPrice / price;
          if (ratio > 10 || ratio < 0.1) {
            // Suspicious ratio suggests unit mismatch
            if (price < 50) {
              return price * 31.1035;
            }
          }
        }
      }
      return price;
    };

    // Record current prices
    await Promise.all([
      recordPriceHistory("GOLD_USD", goldUSD, "USD"),
      recordPriceHistory("SILVER_USD", silverUSD, "USD"),
      recordPriceHistory("MYR_USD", exchangeRates.MYR, "USD"),
      recordPriceHistory("MYR_INR", exchangeRates.INR / exchangeRates.MYR, "INR"),
    ]);

    // Record 24h ago prices if available (normalized to per ounce)
    // These are stored with _24H suffix to distinguish from current prices
    const record24hAgoPromises = [];
    if (gold24hAgo !== null) {
      const normalized = normalizePrice(gold24hAgo, "GOLD_USD", goldUSD);
      record24hAgoPromises.push(
        recordPriceHistory("GOLD_USD_24H", normalized, "USD")
      );
    }
    if (silver24hAgo !== null) {
      const normalized = normalizePrice(silver24hAgo, "SILVER_USD", silverUSD);
      record24hAgoPromises.push(
        recordPriceHistory("SILVER_USD_24H", normalized, "USD")
      );
    }
    if (myrUsd24hAgo !== null) {
      record24hAgoPromises.push(
        recordPriceHistory("MYR_USD_24H", myrUsd24hAgo, "USD")
      );
    }
    if (myrInr24hAgo !== null) {
      record24hAgoPromises.push(
        recordPriceHistory("MYR_INR_24H", myrInr24hAgo, "INR")
      );
    }

    if (record24hAgoPromises.length > 0) {
      await Promise.all(record24hAgoPromises);
    }

    // Also ensure any missing 24h history is recorded (uses existing history, no API calls)
    ensure24hHistoryRecorded().catch(err => 
      console.error("Failed to ensure 24h history in recordCurrentPricesToHistory:", err)
    );

    console.log("Price history recorded successfully (current + 24h ago)");
  } catch (error) {
    console.error("Error recording price history:", error);
    // Don't throw - this is a background operation
  }
}
