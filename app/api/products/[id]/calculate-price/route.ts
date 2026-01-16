import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/db/products";
import { calculateProductPrice } from "@/lib/pricing/calculate-product-price";

/**
 * Calculate current price for a product based on metal prices and exchange rates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get("currency") || "USD") as "USD" | "MYR" | "INR";

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const { price, metadata } = await calculateProductPrice(product, currency);

    return NextResponse.json({
      productId: id,
      price,
      currency,
      metadata: {
        metalType: metadata.metalType,
        metalPriceUSD: metadata.metalPriceUSD,
        exchangeRateMYR: metadata.exchangeRateMYR,
        exchangeRateINR: metadata.exchangeRateINR,
        weight: metadata.weight,
        purity: metadata.purity,
        calculatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error calculating product price:", error);
    return NextResponse.json(
      { error: "Failed to calculate price" },
      { status: 500 }
    );
  }
}
