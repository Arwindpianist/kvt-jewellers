import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/db/orders";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Update order status endpoint (admin/staff only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await verifyStaffAuth(request);
    const { orderId } = await params;

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin or staff
    const supabase = createServiceRoleClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!user || !['admin', 'staff'].includes(user.role)) {
      return NextResponse.json(
        { error: "Staff access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'payment_pending', 'payment_verified', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const success = await updateOrderStatus(orderId, status as any);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
