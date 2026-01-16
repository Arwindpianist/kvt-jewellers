import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductActive,
} from "@/lib/db/products";
import { logActivity } from "@/lib/activity-log";

/**
 * GET /api/products/[id] - Get product by ID (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ product });
}

/**
 * PUT /api/products/[id] - Update product (staff only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get current product for logging
    const currentProduct = await getProductById(id);
    
    const product = await updateProduct(id, body);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Log changes
    const changes: Record<string, { from: any; to: any }> = {};
    Object.keys(body).forEach((key) => {
      if (currentProduct && (currentProduct as any)[key] !== (body as any)[key]) {
        changes[key] = { from: (currentProduct as any)[key], to: (body as any)[key] };
      }
    });

    if (Object.keys(changes).length > 0) {
      logActivity(
        "product_updated",
        session.user.id,
        session.user.name,
        "product",
        product.id,
        product.name,
        `Updated product: ${product.name}`,
        changes
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id] - Delete product (staff only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get product name before deletion
    const product = await getProductById(id);
    
    const success = await deleteProduct(id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Log activity
    if (product) {
      logActivity(
        "product_deleted",
        session.user.id,
        session.user.name,
        "product",
        id,
        product.name,
        `Deleted product: ${product.name}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id] - Update product active status (staff only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Active status must be a boolean" },
        { status: 400 }
      );
    }

    const product = await updateProductActive(id, active);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Log activity
    logActivity(
      "product_updated",
      session.user.id,
      session.user.name,
      "product",
      product.id,
      product.name,
      `${active ? "Activated" : "Deactivated"} product: ${product.name}`,
      { active: { from: !active, to: active } }
    );

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product status:", error);
    return NextResponse.json(
      { error: "Failed to update product status" },
      { status: 500 }
    );
  }
}