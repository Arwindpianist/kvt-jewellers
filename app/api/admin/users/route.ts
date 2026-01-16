import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Get all users (admin only)
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

    // Get all users with order counts
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        order_count:orders(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Transform the data to include order count
    const usersWithCounts = users?.map((user: any) => ({
      ...user,
      order_count: user.order_count?.[0]?.count || 0,
    })) || [];

    return NextResponse.json({
      users: usersWithCounts,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
