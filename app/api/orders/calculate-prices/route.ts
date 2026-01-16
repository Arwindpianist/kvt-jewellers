import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/db/products";
import { calculateProductPrices } from "@/lib/pricing/calculate-product-price";

/**
 * Calculate current prices for multiple products (used at checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, currency = "USD" } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Fetch products
    const products = await Promise.all(
      items.map(async (item: { productId: string; quantity: number }) => {
        const product = await getProductById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        return { product, quantity: item.quantity };
      })
    );

    // Calculate prices
    const pricedItems = await calculateProductPrices(
      products,
      currency as "USD" | "MYR" | "INR"
    );

    return NextResponse.json({
      items: pricedItems.map(({ product, quantity, price, metadata }) => ({
        productId: product.id,
        quantity,
        price,
        metadata: {
          metalType: metadata.metalType,
          metalPriceUSD: metadata.metalPriceUSD,
          exchangeRateMYR: metadata.exchangeRateMYR,
          exchangeRateINR: metadata.exchangeRateINR,
          currency: metadata.currency,
          weight: metadata.weight,
          purity: metadata.purity,
          calculatedAt: new Date().toISOString(),
        },
      })),
      total: pricedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });
  } catch (error: any) {
    console.error("Error calculating prices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate prices" },
      { status: 500 }
    );
  }
}
