import { NextRequest, NextResponse } from "next/server";
import { fetchGoldPricesFromAPI } from "@/lib/gold-prices";

/**
 * Internal API endpoint for fetching gold prices
 * This endpoint is server-only and should NOT be called from client components
 * Staff routes should use this to get all prices (including unpublished)
 */
export async function GET(request: NextRequest) {
  try {
    const prices = await fetchGoldPricesFromAPI();
    
    return NextResponse.json({
      prices,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in gold-prices API:", error);
    return NextResponse.json(
      { error: "Failed to fetch gold prices" },
      { status: 500 }
    );
  }
}

