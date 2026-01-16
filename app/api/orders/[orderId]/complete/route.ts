import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { completeOrder } from "@/lib/db/orders";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Complete order endpoint (admin only)
 * Marks order as completed after payment verification
 */
export async function POST(
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

    // Check order status - must be payment_verified
    const { data: order } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== 'payment_verified') {
      return NextResponse.json(
        { error: "Order must be payment verified before completion" },
        { status: 400 }
      );
    }

    const success = await completeOrder(orderId, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to complete order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order completed successfully",
    });
  } catch (error) {
    console.error("Error completing order:", error);
    return NextResponse.json(
      { error: "Failed to complete order" },
      { status: 500 }
    );
  }
}
