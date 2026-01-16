import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory, getMultiplePriceHistory } from "@/lib/db/price-history";

/**
 * GET /api/price-history
 * Fetch historical price data
 * Query params:
 *   - type: Price type (e.g., 'GOLD_USD', 'SILVER_USD') - required
 *   - days: Number of days of history (default: 30)
 *   - limit: Maximum records (default: 1000)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const days = parseInt(searchParams.get("days") || "30", 10);
    const limit = parseInt(searchParams.get("limit") || "1000", 10);
    const types = searchParams.get("types"); // Comma-separated list

    if (types) {
      // Multiple types
      const typeArray = types.split(",").map((t) => t.trim());
      const history = await getMultiplePriceHistory(typeArray, days, limit);
      return NextResponse.json({ history });
    }

    if (!type) {
      return NextResponse.json(
        { error: "Price type is required" },
        { status: 400 }
      );
    }

    const history = await getPriceHistory(type, days, limit);

    return NextResponse.json({
      type,
      history,
      count: history.length,
    });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
