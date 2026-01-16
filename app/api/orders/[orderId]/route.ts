import { NextRequest, NextResponse } from "next/server";
import { getCustomerUser } from "@/lib/auth/customer";
import { getOrderById } from "@/lib/db/orders";

/**
 * Get order by ID endpoint
 */
export async function GET(
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

    const order = await getOrderById(orderId, user.id);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}