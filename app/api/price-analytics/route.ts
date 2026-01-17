import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPriceHistory } from "@/lib/db/price-history";
import { fetchGoldPriceUSD, fetchSilverPriceUSD } from "@/lib/gold-price-api";
import { fetchExchangeRates } from "@/lib/currency-converter";
import { ensure24hHistoryRecorded } from "@/lib/ensure-24h-history";

interface PriceAnalytics {
  goldPrice: {
    current: number;
    price24hAgo: number | null;
    change: number | null; // percentage change
    changeAmount: number | null;
    recommendation: string | null;
  };
  silverPrice: {
    current: number;
    price24hAgo: number | null;
    change: number | null;
    changeAmount: number | null;
    recommendation: string | null;
  };
  exchangeRates: {
    MYR_USD: {
      current: number;
      price24hAgo: number | null;
      change: number | null;
      recommendation: string | null;
    };
    MYR_INR: {
      current: number;
      price24hAgo: number | null;
      change: number | null;
      recommendation: string | null;
    };
  };
  currency: {
    current: string;
    strength: "stronger" | "weaker" | "neutral" | null;
    change: number | null;
    recommendation: string | null;
  };
}

/**
 * Get price analytics comparing current prices to 24 hours ago
 * GET /api/price-analytics?currency=USD|MYR|INR
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get("currency") || "MYR") as "USD" | "MYR" | "INR";

    // Fetch current prices
    const [goldUSD, silverUSD, exchangeRates] = await Promise.all([
      fetchGoldPriceUSD(),
      fetchSilverPriceUSD(),
      fetchExchangeRates(),
    ]);

    // Ensure 24h history is recorded (non-blocking, uses existing history)
    ensure24hHistoryRecorded().catch(err => 
      console.error("Failed to ensure 24h history in price-analytics API:", err)
    );

    // Get prices from 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Fetch historical prices (check both current and 24h ago records)
    const [goldHistory, silverHistory, myrUsdHistory, myrInrHistory, gold24hHistory, silver24hHistory, myrUsd24hHistory, myrInr24hHistory] = await Promise.all([
      getPriceHistory("GOLD_USD", 2, 10), // Get last 2 days, max 10 records
      getPriceHistory("SILVER_USD", 2, 10),
      getPriceHistory("MYR_USD", 2, 10),
      getPriceHistory("MYR_INR", 2, 10),
      getPriceHistory("GOLD_USD_24H", 2, 10), // 24h ago records
      getPriceHistory("SILVER_USD_24H", 2, 10),
      getPriceHistory("MYR_USD_24H", 2, 10),
      getPriceHistory("MYR_INR_24H", 2, 10),
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

      // Accept records between 18-30 hours ago (to account for recording intervals)
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

    // Normalize price to per ounce (ensure consistency)
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

    // Try to get 24h ago from dedicated 24H records first, then fall back to current history
    const get24hAgoPrice = (currentHistory: any[], historical24h: any[], priceType: string, currentPrice: number) => {
      // First try dedicated 24H records (most recent one)
      if (historical24h && historical24h.length > 0) {
        const sorted24h = [...historical24h].sort(
          (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        );
        const price = sorted24h[0]?.price_value;
        return price ? normalizePrice(price, priceType, currentPrice) : null;
      }
      // Fall back to finding in current history
      const price = findPrice24hAgo(currentHistory);
      return price ? normalizePrice(price, priceType, currentPrice) : null;
    };

    const gold24hAgo = get24hAgoPrice(goldHistory, gold24hHistory, "GOLD_USD", goldUSD);
    const silver24hAgo = get24hAgoPrice(silverHistory, silver24hHistory, "SILVER_USD", silverUSD);
    const myrUsd24hAgo = get24hAgoPrice(myrUsdHistory, myrUsd24hHistory, "MYR_USD", exchangeRates.MYR);
    const myrInr24hAgo = get24hAgoPrice(myrInrHistory, myrInr24hHistory, "MYR_INR", exchangeRates.INR / exchangeRates.MYR);

    // Calculate percentage changes
    const calculateChange = (current: number, past: number | null) => {
      if (past === null) return null;
      return ((current - past) / past) * 100;
    };

    const goldChange = calculateChange(goldUSD, gold24hAgo);
    const silverChange = calculateChange(silverUSD, silver24hAgo);
    const myrUsdChange = calculateChange(exchangeRates.MYR, myrUsd24hAgo);
    const myrInrChange = myrInr24hAgo ? calculateChange(exchangeRates.INR / exchangeRates.MYR, myrInr24hAgo) : null;

    // Generate recommendations
    const getGoldRecommendation = (change: number | null): string | null => {
      if (change === null) return null;
      if (change < -1) return "Great time to buy! Gold is down significantly.";
      if (change < -0.5) return "Good opportunity - gold prices are lower.";
      if (change > 2) return "Prices are up - consider waiting for a dip.";
      return null;
    };

    const getSilverRecommendation = (change: number | null): string | null => {
      if (change === null) return null;
      if (change < -1) return "Excellent buying opportunity - silver is down.";
      if (change < -0.5) return "Good time to buy - silver prices are lower.";
      if (change > 2) return "Silver prices are elevated - consider waiting.";
      return null;
    };

    const getCurrencyRecommendation = (
      currency: "USD" | "MYR" | "INR",
      myrUsdChange: number | null,
      myrInrChange: number | null
    ): { strength: "stronger" | "weaker" | "neutral" | null; change: number | null; recommendation: string | null } => {
      if (currency === "MYR") {
        // For MYR, check if it's stronger/weaker against USD
        if (myrUsdChange === null) return { strength: null, change: null, recommendation: null };
        const myrStrength = -myrUsdChange; // If USD/MYR goes up, MYR is weaker
        if (myrStrength > 1) {
          return {
            strength: "stronger",
            change: myrStrength,
            recommendation: "Your currency is stronger - great time to buy!",
          };
        } else if (myrStrength < -1) {
          return {
            strength: "weaker",
            change: myrStrength,
            recommendation: "Your currency is weaker - prices may be higher.",
          };
        }
        return { strength: "neutral", change: myrStrength, recommendation: null };
      } else if (currency === "USD") {
        // For USD, check MYR/USD change (if MYR/USD goes up, USD is weaker against MYR)
        if (myrUsdChange === null) return { strength: null, change: null, recommendation: null };
        const usdStrength = -myrUsdChange;
        if (usdStrength > 1) {
          return {
            strength: "stronger",
            change: usdStrength,
            recommendation: "USD is stronger - favorable exchange rate!",
          };
        } else if (usdStrength < -1) {
          return {
            strength: "weaker",
            change: usdStrength,
            recommendation: "USD is weaker - prices may be higher.",
          };
        }
        return { strength: "neutral", change: usdStrength, recommendation: null };
      } else if (currency === "INR") {
        // For INR, check MYR/INR change
        if (myrInrChange === null) return { strength: null, change: null, recommendation: null };
        const inrStrength = -myrInrChange;
        if (inrStrength > 1) {
          return {
            strength: "stronger",
            change: inrStrength,
            recommendation: "INR is stronger - good time to purchase!",
          };
        } else if (inrStrength < -1) {
          return {
            strength: "weaker",
            change: inrStrength,
            recommendation: "INR is weaker - prices may be higher.",
          };
        }
        return { strength: "neutral", change: inrStrength, recommendation: null };
      }
      return { strength: null, change: null, recommendation: null };
    };

    const currencyAnalytics = getCurrencyRecommendation(currency, myrUsdChange, myrInrChange);

    const analytics: PriceAnalytics = {
      goldPrice: {
        current: goldUSD,
        price24hAgo: gold24hAgo,
        change: goldChange,
        changeAmount: gold24hAgo ? goldUSD - gold24hAgo : null,
        recommendation: getGoldRecommendation(goldChange),
      },
      silverPrice: {
        current: silverUSD,
        price24hAgo: silver24hAgo,
        change: silverChange,
        changeAmount: silver24hAgo ? silverUSD - silver24hAgo : null,
        recommendation: getSilverRecommendation(silverChange),
      },
      exchangeRates: {
        MYR_USD: {
          current: exchangeRates.MYR,
          price24hAgo: myrUsd24hAgo,
          change: myrUsdChange,
          recommendation: null,
        },
        MYR_INR: {
          current: exchangeRates.INR / exchangeRates.MYR,
          price24hAgo: myrInr24hAgo,
          change: myrInrChange,
          recommendation: null,
        },
      },
      currency: {
        current: currency,
        ...currencyAnalytics,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching price analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch price analytics" },
      { status: 500 }
    );
  }
}
