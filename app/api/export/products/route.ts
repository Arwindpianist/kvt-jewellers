import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";

/**
 * Staff-only endpoint for exporting products to CSV
 */
export async function GET(request: NextRequest) {
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const products = getAllProducts();

    // Convert to CSV
    const headers = [
      "ID",
      "Name",
      "Category",
      "Description",
      "Price (MYR)",
      "Weight (g)",
      "Purity",
      "Images",
    ];

    const rows = products.map((product) => [
      product.id,
      product.name,
      product.category,
      product.description || "",
      product.price?.toString() || "",
      product.weight?.toString() || "",
      product.purity || "",
      product.images.join("; "),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="products-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting products:", error);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}
