/**
 * Ensures 24h ago prices are recorded in the database
 * Called automatically when prices are fetched to keep history in sync
 * Respects 2 API calls per day limit - only uses existing history data
 */

import { getPriceHistory, recordPriceHistory } from "@/lib/db/price-history";

/**
 * Ensures 24h ago prices are recorded if missing
 * This function does NOT make API calls - it only uses existing history
 */
export async function ensure24hHistoryRecorded(): Promise<void> {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Check for each price type
    const priceTypes = ["GOLD_USD", "SILVER_USD", "MYR_USD", "MYR_INR"];

    for (const priceType of priceTypes) {
      // Check if we already have a recent 24H record
      const existing24h = await getPriceHistory(`${priceType}_24H`, 1, 3);
      
      // Check if we have a recent 24H record (within last 6 hours)
      const recent24h = existing24h.find(record => {
        const recordTime = new Date(record.recorded_at).getTime();
        const hoursDiff = (Date.now() - recordTime) / (60 * 60 * 1000);
        return hoursDiff < 6;
      });

      if (recent24h) {
        // Already have a recent 24H record, skip
        continue;
      }

      // Get current history to find 24h ago price
      const currentHistory = await getPriceHistory(priceType, 2, 10);
      
      if (!currentHistory || currentHistory.length === 0) {
        // No history yet, can't determine 24h ago price
        continue;
      }

      // Find price closest to 24 hours ago
      const sorted = [...currentHistory].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );

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

      // Normalize price to per ounce (ensure consistency)
      // Gold per ounce is typically $2000-$3000, per gram is $60-$100
      // Silver per ounce is typically $20-$40, per gram is $0.60-$1.30
      const normalizePrice = (price: number, priceType: string): number => {
        if (priceType === "GOLD_USD") {
          // If price is suspiciously low (< $500), likely per gram
          if (price < 500) {
            return price * 31.1035;
          }
        } else if (priceType === "SILVER_USD") {
          // If price is suspiciously low (< $5), likely per gram
          if (price < 5) {
            return price * 31.1035;
          }
        }
        return price;
      };

      // Accept records between 18-30 hours ago
      const hoursDiff = closestDiff / (60 * 60 * 1000);
      if (hoursDiff >= 18 && hoursDiff <= 30) {
        // Normalize price to per ounce (ensure consistency)
        const normalizedPrice = normalizePrice(closest.price_value, priceType);
        
        // Record the 24h ago price (normalized to per ounce)
        await recordPriceHistory(`${priceType}_24H`, normalizedPrice, closest.currency);
        console.log(`Recorded 24h ago price for ${priceType}: ${normalizedPrice} (normalized from ${closest.price_value})`);
      } else {
        // Try to find the oldest record (at least 12 hours old)
        const oldestRecord = sorted[sorted.length - 1];
        if (oldestRecord) {
          const oldestTime = new Date(oldestRecord.recorded_at).getTime();
          const oldestHoursDiff = (Date.now() - oldestTime) / (60 * 60 * 1000);
          if (oldestHoursDiff >= 12) {
            // Normalize price to per ounce
            const normalizedPrice = normalizePrice(oldestRecord.price_value, priceType);
            
            await recordPriceHistory(`${priceType}_24H`, normalizedPrice, oldestRecord.currency);
            console.log(`Recorded oldest available price as 24h ago for ${priceType}: ${normalizedPrice} (normalized from ${oldestRecord.price_value})`);
          }
        }
      }
    }
  } catch (error) {
    // Don't throw - this is a background operation
    console.error("Error ensuring 24h history:", error);
  }
}
