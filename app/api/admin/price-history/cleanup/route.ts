import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { cleanupAllPriceHistoryByLimit } from "@/lib/db/price-history";

/**
 * Clean up old price history records (admin only)
 * POST /api/admin/price-history/cleanup
 * Keeps only the 3 most recent records per price_type
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

    // Check if user is admin
    const supabase = createServiceRoleClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get current record count before cleanup
    const { count: countBefore } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true });

    // Clean up all price history using database function (keep 3 most recent per price_type)
    const results = await cleanupAllPriceHistoryByLimit(3);

    // Get record count after cleanup
    const { count: countAfter } = await supabase
      .from('price_history')
      .select('*', { count: 'exact', head: true });

    const totalDeleted = (countBefore || 0) - (countAfter || 0);
    
    // Calculate total deleted from results
    const totalDeletedFromResults = Object.values(results).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      success: true,
      message: "Price history cleanup completed",
      deletedByType: results,
      totalDeleted,
      totalDeletedFromResults,
      recordsBefore: countBefore || 0,
      recordsAfter: countAfter || 0,
      note: "Automatic cleanup is now handled by database trigger on each insert",
    });
  } catch (error) {
    console.error("Error cleaning up price history:", error);
    return NextResponse.json(
      { error: "Failed to cleanup price history" },
      { status: 500 }
    );
  }
}
