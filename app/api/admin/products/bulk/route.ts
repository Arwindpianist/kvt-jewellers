import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { updateProduct } from "@/lib/db/products";

/**
 * Bulk update products (admin/staff only)
 * Body: { productIds: string[], updates: Partial<Product> }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifyStaffAuth(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productIds, updates } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "productIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "updates must be an object" },
        { status: 400 }
      );
    }

    // Update each product
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const productId of productIds) {
      try {
        const updated = await updateProduct(productId, updates);
        if (updated) {
          successCount++;
          results.push({ productId, success: true });
        } else {
          errorCount++;
          results.push({ productId, success: false, error: "Product not found or update failed" });
        }
      } catch (error) {
        errorCount++;
        results.push({
          productId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: productIds.length,
        success: successCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/admin/products/bulk:", error);
    return NextResponse.json(
      { error: "Failed to bulk update products" },
      { status: 500 }
    );
  }
}

/**
 * Bulk delete products (admin/staff only)
 * Body: { productIds: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyStaffAuth(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "productIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Delete products (or mark as inactive)
    const { data, error } = await supabase
      .from("products")
      .update({ active: false })
      .in("id", productIds)
      .select("id");

    if (error) {
      console.error("Error bulk deleting products:", error);
      return NextResponse.json(
        { error: "Failed to delete products" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: data?.length || 0,
      total: productIds.length,
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/products/bulk:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete products" },
      { status: 500 }
    );
  }
}
