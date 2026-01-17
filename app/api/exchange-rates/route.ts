import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ensure24hHistoryRecorded } from "@/lib/ensure-24h-history";
import { fetchGoldPricesFromAPI } from "@/lib/gold-prices";

interface ExchangeRates {
  USD: number;
  MYR: number;
  INR: number;
  timestamp: number;
}

/**
 * Get exchange rates from in-memory gold prices or price_history table
 * Falls back to external API if database doesn't have rates
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get exchange rates from in-memory gold prices first
    try {
      const goldPrices = await fetchGoldPricesFromAPI();
      const myrUsdPrice = goldPrices.find(p => p.type === 'MYR_USD');
      const myrInrPrice = goldPrices.find(p => p.type === 'MYR_INR');

      if (myrUsdPrice && myrInrPrice && myrUsdPrice.isPublished && myrInrPrice.isPublished) {
        // MYR_USD stores MYR per USD (e.g., 4.7 means 1 USD = 4.7 MYR)
        const myrRate = myrUsdPrice.overridePrice ?? myrUsdPrice.fetchedPrice;
        
        // MYR_INR stores INR per MYR, so we need to calculate INR per USD
        // If MYR_INR = 17.6, that means 1 MYR = 17.6 INR
        // So 1 USD = MYR_RATE * INR_PER_MYR
        const myrInrRate = myrInrPrice.overridePrice ?? myrInrPrice.fetchedPrice;
        const inrRate = myrRate * myrInrRate;

        // Ensure 24h history is recorded (non-blocking)
        ensure24hHistoryRecorded().catch(err => 
          console.error("Failed to ensure 24h history in exchange-rates API:", err)
        );

        return NextResponse.json({
          USD: 1,
          MYR: myrRate,
          INR: inrRate,
          timestamp: Date.now(),
        });
      }
    } catch (goldPriceError) {
      console.log("Could not fetch from gold prices, trying price_history...", goldPriceError);
    }

    // Fallback: Try to get from price_history table
    try {
      const supabase = createServiceRoleClient();
      const { data: priceHistory, error } = await supabase
        .from('price_history')
        .select('price_type, price_value, currency')
        .in('price_type', ['MYR_USD', 'MYR_INR'])
        .order('recorded_at', { ascending: false })
        .limit(2);

      if (!error && priceHistory && priceHistory.length >= 2) {
        const myrUsdEntry = priceHistory.find(p => p.price_type === 'MYR_USD');
        const myrInrEntry = priceHistory.find(p => p.price_type === 'MYR_INR');

        if (myrUsdEntry && myrInrEntry) {
          const myrRate = myrUsdEntry.price_value;
          const myrInrRate = myrInrEntry.price_value;
          const inrRate = myrRate * myrInrRate;

          return NextResponse.json({
            USD: 1,
            MYR: myrRate,
            INR: inrRate,
            timestamp: Date.now(),
          });
        }
      }
    } catch (dbError) {
      console.log("Could not fetch from price_history, falling back to external API...", dbError);
    }

    // Fallback to external API if database doesn't have rates
    console.log("Exchange rates not found in database, fetching from API...");
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD",
        {
          next: { revalidate: 3600 }, // 1 hour
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          USD: 1,
          MYR: data.rates.MYR || 4.7,
          INR: data.rates.INR || 83.0,
          timestamp: Date.now(),
        });
      }
    } catch (apiError) {
      console.error("Error fetching exchange rates from API:", apiError);
    }

    // Final fallback to approximate rates
    return NextResponse.json({
      USD: 1,
      MYR: 4.7,
      INR: 83.0,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}
