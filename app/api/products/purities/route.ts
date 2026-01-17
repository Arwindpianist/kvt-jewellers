import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Get unique product purities (optimized endpoint)
 * Returns only distinct purity values, not full products
 */
export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    
    // Fetch only distinct purity values from active products
    const { data, error } = await supabase
      .from('products')
      .select('purity')
      .eq('active', true)
      .not('purity', 'is', null);
    
    if (error) {
      console.error("Error fetching purities:", error);
      return NextResponse.json(
        { error: "Failed to fetch purities", details: error.message },
        { status: 500 }
      );
    }

    // Extract unique purities and sort
    const uniquePurities = Array.from(
      new Set((data || []).map((p: { purity: string | null }) => p.purity).filter((p): p is string => p !== null && p !== undefined))
    ).sort();

    return NextResponse.json({ purities: uniquePurities });
  } catch (error) {
    console.error("Error in GET /api/products/purities:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch purities",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
