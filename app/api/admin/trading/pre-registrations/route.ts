import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * Get all trading pre-registrations (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

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
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all pre-registrations
    const { data: registrations, error } = await supabase
      .from("trading_pre_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching pre-registrations:", error);
      return NextResponse.json(
        { error: "Failed to fetch pre-registrations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      registrations: registrations || [],
    });
  } catch (error) {
    logger.error("Error in GET pre-registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch pre-registrations" },
      { status: 500 }
    );
  }
}
