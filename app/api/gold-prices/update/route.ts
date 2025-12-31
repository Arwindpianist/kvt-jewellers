import { NextRequest, NextResponse } from "next/server";
import { updatePriceOverride, fetchGoldPricesFromAPI } from "@/lib/gold-prices";
import { verifyStaffAuth } from "@/lib/auth";

/**
 * Staff-only endpoint for updating price overrides and publish status
 */
export async function POST(request: NextRequest) {
  // Verify staff authentication
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { priceId, overridePrice, isPublished } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "priceId is required" },
        { status: 400 }
      );
    }

    // Update the override
    updatePriceOverride(priceId, {
      overridePrice: overridePrice !== undefined ? overridePrice : undefined,
      isPublished: isPublished !== undefined ? isPublished : undefined,
    });

    // Refresh prices to get updated data
    const prices = await fetchGoldPricesFromAPI();

    return NextResponse.json({
      success: true,
      prices,
    });
  } catch (error) {
    console.error("Error updating gold price:", error);
    return NextResponse.json(
      { error: "Failed to update gold price" },
      { status: 500 }
    );
  }
}

