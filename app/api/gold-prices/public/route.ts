import { NextRequest, NextResponse } from "next/server";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";

/**
 * Public API endpoint for fetching published gold prices
 * This endpoint is safe to call from client components
 * Returns only published prices (public-facing)
 */
export async function GET(request: NextRequest) {
  try {
    const allPrices = await fetchGoldPricesFromAPI();
    const publishedPrices = getPublishedGoldPrices(allPrices);
    
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
