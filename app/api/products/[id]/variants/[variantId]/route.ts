import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { updateProductVariant, deleteProductVariant } from "@/lib/db/products";
import type { ProductVariant } from "@/types/products";

/**
 * PUT /api/products/[id]/variants/[variantId]
 * Update a variant (staff only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const session = await verifyStaffAuth(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { variantId } = await params;
    const body = await request.json();

    const updates: Partial<ProductVariant> = {};
    
    if (body.size !== undefined) updates.size = body.size || undefined;
    if (body.finish !== undefined) updates.finish = body.finish || undefined;
    if (body.metalType !== undefined) updates.metalType = body.metalType || undefined;
    if (body.designStyle !== undefined) updates.designStyle = body.designStyle || undefined;
    if (body.stoneType !== undefined) updates.stoneType = body.stoneType || undefined;
    if (body.weight !== undefined) updates.weight = body.weight ? Number(body.weight) : undefined;
    if (body.additionalPrice !== undefined) updates.additionalPrice = Number(body.additionalPrice);
    if (body.basePrice !== undefined) updates.basePrice = body.basePrice ? Number(body.basePrice) : undefined;
    if (body.active !== undefined) updates.active = body.active;

    const variant = await updateProductVariant(variantId, updates);

    if (!variant) {
      return NextResponse.json(
        { error: "Failed to update variant" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      variant,
    });
  } catch (error) {
    console.error("Error in PUT /api/products/[id]/variants/[variantId]:", error);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]/variants/[variantId]
 * Delete a variant (staff only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const session = await verifyStaffAuth(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { variantId } = await params;

    const success = await deleteProductVariant(variantId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete variant" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/products/[id]/variants/[variantId]:", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
