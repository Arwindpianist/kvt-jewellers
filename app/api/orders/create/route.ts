import { NextRequest, NextResponse } from "next/server";
import { getCustomerUser } from "@/lib/auth/customer";
import { createOrder } from "@/lib/db/orders";
import { sendOrderConfirmationEmail } from "@/lib/notifications/order-notifications";
import { validateOrderInput } from "@/lib/validation/order";

/**
 * Create order endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCustomerUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body;

    // Validate order input
    const validationErrors = validateOrderInput({ items });
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0].message, errors: validationErrors },
        { status: 400 }
      );
    }

    // Items should already have calculated prices and metadata from checkout
    // If not, we'll use the provided price (fallback for backward compatibility)
    const orderItems = items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      metadata: item.metadata || undefined,
    }));

    const { order, error } = await createOrder(user.id, orderItems);

    if (error || !order) {
      return NextResponse.json(
        { error: error || "Failed to create order" },
        { status: 500 }
      );
    }

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(order, user.email, user.name);
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        payment_reference: order.payment_reference,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}