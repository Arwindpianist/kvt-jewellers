import { NextRequest, NextResponse } from "next/server";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";

// Simple rate limiting (in production, use a proper rate limiter)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests per minute
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
 * Public API endpoint for gold prices
 * Returns only published prices
 * Implements rate limiting
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "unknown";
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  try {
    const prices = await fetchGoldPricesFromAPI();
    const publishedPrices = getPublishedGoldPrices(prices);

    // Return only published prices, never expose internal data
    return NextResponse.json({
      prices: publishedPrices.map((price) => ({
        id: price.id,
        type: price.type,
        price: price.overridePrice ?? price.fetchedPrice,
        currency: price.currency,
        lastUpdated: price.lastUpdated,
      })),
      fetchedAt: new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error in public gold-prices API:", error);
    return NextResponse.json(
      { error: "Failed to fetch gold prices" },
      { status: 500 }
    );
  }
}

