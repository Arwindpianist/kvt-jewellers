import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getProductVariants, createProductVariant } from "@/lib/db/products";
import type { ProductVariant } from "@/types/products";

/**
 * GET /api/products/[id]/variants
 * Get all variants for a product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const variants = await getProductVariants(id);

    return NextResponse.json({
      variants,
    });
  } catch (error) {
    console.error("Error in GET /api/products/[id]/variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/variants
 * Create a new variant (staff only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyStaffAuth(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const variantData: Omit<ProductVariant, 'id' | 'createdAt' | 'updatedAt'> = {
      productId: id,
      size: body.size || undefined,
      finish: body.finish || undefined,
      metalType: body.metalType || undefined,
      designStyle: body.designStyle || undefined,
      stoneType: body.stoneType || undefined,
      weight: body.weight ? Number(body.weight) : undefined,
      additionalPrice: body.additionalPrice ? Number(body.additionalPrice) : 0,
      basePrice: body.basePrice ? Number(body.basePrice) : undefined,
      active: body.active !== false,
    };

    const variant = await createProductVariant(variantData);

    if (!variant) {
      return NextResponse.json(
        { error: "Failed to create variant. Duplicate variant may exist." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      variant,
    });
  } catch (error) {
    console.error("Error in POST /api/products/[id]/variants:", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
