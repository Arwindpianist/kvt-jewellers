import { NextRequest, NextResponse } from "next/server";
import { fetchHistoricalGoldPrices, fetchHistoricalSilverPrices } from "@/lib/gold-price-api-historical";

// Rate limiting for historical data API
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // requests per minute (more restrictive for historical data)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * GET /api/price-history/market
 * Fetch real historical market data from external APIs
 * Query params:
 *   - type: Price type ('GOLD_USD' or 'SILVER_USD')
 *   - days: Number of days (default: 30)
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown";
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "GOLD_USD";
    const days = parseInt(searchParams.get("days") || "30", 10);
    const currency = (searchParams.get("currency") as "USD" | "MYR" | "INR") || "USD";

    // Limit days to reasonable range
    const validDays = Math.min(Math.max(days, 7), 365);

    let historicalData;

    if (type === "GOLD_USD" || type === "GOLD") {
      historicalData = await fetchHistoricalGoldPrices(validDays, currency);
    } else if (type === "SILVER_USD" || type === "SILVER") {
      historicalData = await fetchHistoricalSilverPrices(validDays, currency);
    } else {
      return NextResponse.json(
        { error: "Invalid price type. Use 'GOLD_USD' or 'SILVER_USD'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      type,
      data: historicalData,
      count: historicalData.length,
      source: "market_api",
    });
  } catch (error: any) {
    console.error("Error fetching market historical prices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch historical market data" },
      { status: 500 }
    );
  }
}
