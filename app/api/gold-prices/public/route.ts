import { NextRequest, NextResponse } from "next/server";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";
import { ensure24hHistoryRecorded } from "@/lib/ensure-24h-history";

/**
 * Public API endpoint for fetching published gold prices
 * This endpoint is safe to call from client components
 * Returns only published prices (public-facing)
 * Automatically ensures 24h history is recorded
 */
export async function GET(request: NextRequest) {
  try {
    const allPrices = await fetchGoldPricesFromAPI();
    const publishedPrices = getPublishedGoldPrices(allPrices);
    
    // Ensure 24h history is recorded (non-blocking, uses existing history)
    ensure24hHistoryRecorded().catch(err => 
      console.error("Failed to ensure 24h history in public gold-prices API:", err)
    );
    
    return NextResponse.json({
      prices: publishedPrices,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in public gold-prices API:", error);
    return NextResponse.json(
      { error: "Failed to fetch gold prices" },
      { status: 500 }
    );
  }
}
