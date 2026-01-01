import { NextRequest, NextResponse } from "next/server";
import { updatePriceOverride, fetchGoldPricesFromAPI } from "@/lib/gold-prices";
import { verifyStaffAuth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

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
    const { 
      priceId, 
      overridePrice, 
      isPublished,
      buyPercentage,
      sellPercentage,
      usePresetExchangeRate,
      presetExchangeRate
    } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "priceId is required" },
        { status: 400 }
      );
    }

    // Get current price data for logging changes
    const currentPrices = await fetchGoldPricesFromAPI();
    const currentPrice = currentPrices.find((p) => p.id === priceId);
    
    // Track changes
    const changes: Record<string, { from: any; to: any }> = {};
    if (overridePrice !== undefined && currentPrice?.overridePrice !== overridePrice) {
      changes.overridePrice = { from: currentPrice?.overridePrice, to: overridePrice };
    }
    if (isPublished !== undefined && currentPrice?.isPublished !== isPublished) {
      changes.isPublished = { from: currentPrice?.isPublished, to: isPublished };
    }
    if (buyPercentage !== undefined && currentPrice?.buyPercentage !== buyPercentage) {
      changes.buyPercentage = { from: currentPrice?.buyPercentage, to: buyPercentage };
    }
    if (sellPercentage !== undefined && currentPrice?.sellPercentage !== sellPercentage) {
      changes.sellPercentage = { from: currentPrice?.sellPercentage, to: sellPercentage };
    }
    if (usePresetExchangeRate !== undefined && currentPrice?.usePresetExchangeRate !== usePresetExchangeRate) {
      changes.usePresetExchangeRate = { from: currentPrice?.usePresetExchangeRate, to: usePresetExchangeRate };
    }
    if (presetExchangeRate !== undefined && currentPrice?.presetExchangeRate !== presetExchangeRate) {
      changes.presetExchangeRate = { from: currentPrice?.presetExchangeRate, to: presetExchangeRate };
    }

    // Update the override
    updatePriceOverride(priceId, {
      overridePrice: overridePrice !== undefined ? overridePrice : undefined,
      isPublished: isPublished !== undefined ? isPublished : undefined,
      buyPercentage: buyPercentage !== undefined ? buyPercentage : undefined,
      sellPercentage: sellPercentage !== undefined ? sellPercentage : undefined,
      usePresetExchangeRate: usePresetExchangeRate !== undefined ? usePresetExchangeRate : undefined,
      presetExchangeRate: presetExchangeRate !== undefined ? presetExchangeRate : undefined,
    });

    // Log the activity
    if (Object.keys(changes).length > 0) {
      const priceType = currentPrice?.type || "UNKNOWN";
      const isBulk = body.isBulk === true;
      const action = isPublished !== undefined && isPublished !== currentPrice?.isPublished
        ? isPublished ? (isBulk ? "Bulk published price" : "Published price") : (isBulk ? "Bulk unpublished price" : "Unpublished price")
        : isBulk ? "Bulk updated price settings" : "Updated price settings";
      
      logActivity(
        isPublished !== undefined && isPublished !== currentPrice?.isPublished
          ? (isPublished ? "price_published" : "price_unpublished")
          : isBulk ? "bulk_update" : "price_updated",
        session.user.id,
        session.user.name,
        "price",
        priceId,
        priceType,
        action,
        changes
      );
    }

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

