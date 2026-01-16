import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Get all staff/admin users (exclude customers) - Admin only
 */
export async function GET(request: NextRequest) {
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

    // Get only staff and admin users (exclude customers)
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['admin', 'staff'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching staff users:", error);
      return NextResponse.json(
        { error: "Failed to fetch staff users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: users || [],
    });
  } catch (error) {
    console.error("Error in GET /api/admin/staff-users:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff users" },
      { status: 500 }
    );
  }
}
