import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { verifyPayment, getOrderById } from "@/lib/db/orders";
import { sendPaymentVerifiedEmail } from "@/lib/notifications/order-notifications";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Verify payment endpoint (admin only)
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

    const success = await verifyPayment(orderId, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 }
      );
    }

    // Send payment verified email to customer
    try {
      const order = await getOrderById(orderId);
      if (order) {
        const { data: customer } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', order.user_id)
          .single();

        if (customer) {
          await sendPaymentVerifiedEmail(order, customer.email, customer.name);
        }
      }
    } catch (emailError) {
      console.error("Failed to send payment verified email:", emailError);
      // Don't fail the verification if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}