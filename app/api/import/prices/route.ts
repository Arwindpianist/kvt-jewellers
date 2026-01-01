import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { updatePriceOverride } from "@/lib/gold-prices";
import { logActivity } from "@/lib/activity-log";

/**
 * Staff-only endpoint for importing prices from CSV
 */
export async function POST(request: NextRequest) {
  const session = await verifyStaffAuth(request);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file must have at least a header and one data row" },
        { status: 400 }
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const dataRows = lines.slice(1);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const values = row.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));

      try {
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || "";
        });

        const priceId = rowData["ID"];
        if (!priceId) {
          errors.push(`Row ${i + 2}: Missing ID`);
          errorCount++;
          continue;
        }

        const updates: any = {};

        if (rowData["Override Price"]) {
          updates.overridePrice = parseFloat(rowData["Override Price"]);
        }

        if (rowData["Is Published"]) {
          updates.isPublished = rowData["Is Published"].toLowerCase() === "yes";
        }

        if (rowData["Buy Percentage"]) {
          updates.buyPercentage = parseFloat(rowData["Buy Percentage"]);
        }

        if (rowData["Sell Percentage"]) {
          updates.sellPercentage = parseFloat(rowData["Sell Percentage"]);
        }

        if (rowData["Use Preset Exchange Rate"]) {
          updates.usePresetExchangeRate = rowData["Use Preset Exchange Rate"].toLowerCase() === "yes";
        }

        if (rowData["Preset Exchange Rate"]) {
          updates.presetExchangeRate = parseFloat(rowData["Preset Exchange Rate"]);
        }

        updatePriceOverride(priceId, updates);

        // Log activity
        logActivity(
          "bulk_update",
          session.user.id,
          session.user.name,
          "price",
          priceId,
          rowData["Type"] || "UNKNOWN",
          "Imported price from CSV",
          updates
        );

        successCount++;
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : "Unknown error"}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // Limit to first 10 errors
    });
  } catch (error) {
    console.error("Error importing prices:", error);
    return NextResponse.json(
      { error: "Failed to import prices" },
      { status: 500 }
    );
  }
}
