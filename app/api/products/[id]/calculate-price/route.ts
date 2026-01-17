import { NextRequest, NextResponse } from "next/server";
import { getProductById, getProductVariant, getProductVariants } from "@/lib/db/products";
import { calculateProductPrice } from "@/lib/pricing/calculate-product-price";
import type { ProductVariant } from "@/types/products";

/**
 * GET /api/products/[id]/calculate-price
 * Calculate current price for a product (legacy support)
 * POST /api/products/[id]/calculate-price
 * Calculate price with variant selection
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

    // If product has variants, require variant selection
    if (product.hasVariants) {
      return NextResponse.json(
        { error: "Product has variants. Please use POST method with variant selection." },
        { status: 400 }
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
        pricingModel: metadata.pricingModel,
        calculatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error calculating product price:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to calculate price" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/calculate-price
 * Calculate price with variant selection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const currency = (body.currency || "USD") as "USD" | "MYR" | "INR";
    const variantId = body.variantId;
    const variantOptions = body.variantOptions; // { size, finish, metalType, designStyle, stoneType }

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    let variant: ProductVariant | null = null;

    // If product has variants, get the variant
    if (product.hasVariants) {
      if (variantId) {
        // Fetch variant by ID (would need a new function, but for now use options)
        const variants = await getProductVariants(id);
        variant = variants.find(v => v.id === variantId) || null;
      } else if (variantOptions) {
        // Get variant by option combination
        variant = await getProductVariant(id, variantOptions);
      }

      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found. Please select a valid variant." },
          { status: 400 }
        );
      }
    }

    const { price, metadata } = await calculateProductPrice(product, currency, variant);

    return NextResponse.json({
      productId: id,
      variantId: variant?.id,
      price,
      currency,
      metadata: {
        metalType: metadata.metalType,
        metalPriceUSD: metadata.metalPriceUSD,
        exchangeRateMYR: metadata.exchangeRateMYR,
        exchangeRateINR: metadata.exchangeRateINR,
        weight: metadata.weight,
        purity: metadata.purity,
        pricingModel: metadata.pricingModel,
        additionalPrice: metadata.additionalPrice,
        calculatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error calculating product price:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to calculate price" },
      { status: 500 }
    );
  }
}
