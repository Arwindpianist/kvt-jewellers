import { NextRequest, NextResponse } from "next/server";
import { recordCurrentPricesToHistory } from "@/lib/price-history-recorder";

/**
 * POST /api/price-history/record
 * Record current prices to history
 * Can be called by a cron job or scheduled task
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    // For now, allow anyone to trigger (can be secured later)
    
    await recordCurrentPricesToHistory();

    return NextResponse.json({
      success: true,
      message: "Prices recorded to history",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error recording price history:", error);
    return NextResponse.json(
      { error: "Failed to record price history" },
      { status: 500 }
    );
  }
}
