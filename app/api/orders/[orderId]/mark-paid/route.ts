import { NextRequest, NextResponse } from "next/server";
import { getCustomerUser } from "@/lib/auth/customer";
import { markPaymentPending } from "@/lib/db/orders";

/**
 * Mark order payment as pending (customer clicked "I Have Paid")
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getCustomerUser();
    const { orderId } = await params;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const success = await markPaymentPending(orderId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }

    // Trigger notifications
    const { getOrderById } = await import("@/lib/db/orders");
    const { sendPaymentPendingNotification } = await import("@/lib/notifications/order-notifications");
    
    const order = await getOrderById(orderId, user.id);
    if (order) {
      // Get customer details
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: customer } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single();

      if (customer) {
        await sendPaymentPendingNotification(order, customer.name, customer.email);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment marked as pending. Staff will verify your payment.",
    });
  } catch (error) {
    console.error("Error marking payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}