import { NextRequest, NextResponse } from "next/server";
import { getCustomerUser } from "@/lib/auth/customer";
import { getOrderById } from "@/lib/db/orders";
import { generatePaymentQRCode } from "@/lib/qr-code";

/**
 * Generate QR code for order payment
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

    const bankName = process.env.PAYMENT_BANK_NAME || "Your Bank";
    const accountNumber = process.env.PAYMENT_ACCOUNT_NUMBER || "1234567890";
    const accountHolder = process.env.PAYMENT_ACCOUNT_HOLDER || "KVT Jewellers";

    const qrCode = await generatePaymentQRCode(
      bankName,
      accountNumber,
      accountHolder,
      Number(order.total),
      order.payment_reference
    );

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}