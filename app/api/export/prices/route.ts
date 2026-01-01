import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { fetchGoldPricesFromAPI } from "@/lib/gold-prices";

/**
 * Staff-only endpoint for exporting prices to CSV
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
    const prices = await fetchGoldPricesFromAPI();

    // Convert to CSV
    const headers = [
      "ID",
      "Type",
      "Currency",
      "Fetched Price",
      "Override Price",
      "Display Price",
      "Buy Percentage",
      "Sell Percentage",
      "Is Published",
      "Use Preset Exchange Rate",
      "Preset Exchange Rate",
      "Last Updated",
    ];

    const rows = prices.map((price) => [
      price.id,
      price.type,
      price.currency,
      price.fetchedPrice.toString(),
      price.overridePrice?.toString() || "",
      (price.overridePrice ?? price.fetchedPrice).toString(),
      price.buyPercentage?.toString() || "",
      price.sellPercentage?.toString() || "",
      price.isPublished ? "Yes" : "No",
      price.usePresetExchangeRate ? "Yes" : "No",
      price.presetExchangeRate?.toString() || "",
      new Date(price.lastUpdated).toISOString(),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="prices-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting prices:", error);
    return NextResponse.json(
      { error: "Failed to export prices" },
      { status: 500 }
    );
  }
}
