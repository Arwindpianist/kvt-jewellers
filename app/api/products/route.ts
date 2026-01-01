import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { logActivity } from "@/lib/activity-log";

/**
 * GET /api/products - Get all products (public)
 */
export async function GET(request: NextRequest) {
  const products = getAllProducts();
  return NextResponse.json({ products });
}

/**
 * POST /api/products - Create product (staff only)
 */
export async function POST(request: NextRequest) {
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const product = createProduct(body);
    
    // Log activity
    logActivity(
      "product_created",
      session.user.id,
      session.user.name,
      "product",
      product.id,
      product.name,
      `Created product: ${product.name}`
    );
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products - Update product (staff only)
 */
export async function PUT(request: NextRequest) {
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    // Get current product for logging
    const allProducts = getAllProducts();
    const currentProduct = allProducts.find((p) => p.id === id);
    
    const product = updateProduct(id, updates);
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Log changes
    const changes: Record<string, { from: any; to: any }> = {};
    Object.keys(updates).forEach((key) => {
      if (currentProduct && (currentProduct as any)[key] !== (updates as any)[key]) {
        changes[key] = { from: (currentProduct as any)[key], to: (updates as any)[key] };
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
 * DELETE /api/products - Delete product (staff only)
 */
export async function DELETE(request: NextRequest) {
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get product name before deletion
    const allProducts = getAllProducts();
    const product = allProducts.find((p) => p.id === id);
    
    const success = deleteProduct(id);
    
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

