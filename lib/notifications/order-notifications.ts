import { sendEmail } from "./email";
import { sendWhatsApp } from "./whatsapp";
import type { OrderWithItems } from "@/lib/db/orders";
import { buildUrl } from "@/lib/utils";
import { getBrandedEmailTemplate, getOrderItemsTable } from "./email-templates";

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  order: OrderWithItems,
  customerEmail: string,
  customerName: string
): Promise<void> {
  const orderItems = order.order_items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price_at_purchase,
    total: item.price_at_purchase * item.quantity,
  }));

  const orderItemsTable = getOrderItemsTable(orderItems);
  const paymentUrl = buildUrl("payment", order.id);

  const content = `
    <p>Thank you for your order! Your order has been received and is being processed.</p>
    
    <div style="margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 18px; font-weight: 600; color: #521540;">
        Order Information
      </h3>
      <p style="margin: 8px 0; color: #333;"><strong>Order ID:</strong> ${order.id}</p>
      <p style="margin: 8px 0; color: #333;"><strong>Payment Reference:</strong> ${order.payment_reference}</p>
    </div>

    <div style="margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 18px; font-weight: 600; color: #521540;">
        Order Items
      </h3>
      ${orderItemsTable}
    </div>

    <p style="margin-top: 25px; color: #333;">
      Please proceed to payment using the button below. You will receive payment instructions and a QR code for your convenience.
    </p>
  `;

  const html = getBrandedEmailTemplate({
    title: "Order Confirmation",
    greeting: `Dear ${customerName},`,
    content,
    buttonText: "View Payment Instructions",
    buttonUrl: paymentUrl,
    footerText: "If you have any questions, please don't hesitate to contact our support team.",
  });

  await sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - ${order.payment_reference}`,
    html,
  });
}

/**
 * Send payment pending notification to staff
 */
export async function sendPaymentPendingNotification(
  order: OrderWithItems,
  customerName: string,
  customerEmail: string
): Promise<void> {
  const staffEmail = process.env.STAFF_EMAIL || process.env.ZOHO_FROM_EMAIL || "arwin@arwindpianist.com";
  const staffWhatsApp = process.env.STAFF_WHATSAPP || process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+1234567890";

  // Email to staff
  const orderUrl = buildUrl("staff", "orders", order.id);
  const content = `
    <p style="margin-bottom: 20px;">A customer has marked their payment as sent. Please verify the payment and update the order status.</p>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 8px 0; color: #333;"><strong>Order ID:</strong> ${order.id}</p>
      <p style="margin: 8px 0; color: #333;"><strong>Payment Reference:</strong> ${order.payment_reference}</p>
      <p style="margin: 8px 0; color: #333;"><strong>Customer:</strong> ${customerName}</p>
      <p style="margin: 8px 0; color: #333;"><strong>Email:</strong> ${customerEmail}</p>
      <p style="margin: 8px 0; color: #333;"><strong>Total Amount:</strong> <span style="font-size: 18px; font-weight: 700; color: #521540;">$${Number(order.total).toFixed(2)}</span></p>
    </div>

    <p style="margin-top: 25px; color: #333;">
      Click the button below to view the full order details and verify the payment.
    </p>
  `;

  const emailHtml = getBrandedEmailTemplate({
    title: "Payment Pending - Action Required",
    content,
    buttonText: "View Order & Verify Payment",
    buttonUrl: orderUrl,
    footerText: "This is an automated notification from the KVT Jewellers order management system.",
  });

  await sendEmail({
    to: staffEmail,
    subject: `Payment Pending - Order ${order.payment_reference}`,
    html: emailHtml,
  });

  // WhatsApp to staff
  const whatsappMessage = `🔔 Payment Pending\n\nOrder: ${order.payment_reference}\nCustomer: ${customerName}\nAmount: $${Number(order.total).toFixed(2)}\n\nPlease verify payment.`;

  await sendWhatsApp({
    to: staffWhatsApp,
    message: whatsappMessage,
  });

  // Email to customer
  const customerContent = `
    <p>We have received your payment notification for order <strong>${order.payment_reference}</strong>.</p>
    
    <div style="background-color: #f0f8f0; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #2e7d32; font-weight: 500;">
        ✓ Payment notification received successfully
      </p>
    </div>

    <p style="margin-top: 20px; color: #333;">
      Our staff will verify your payment and update your order status shortly. You will receive another email once your payment has been verified and your order is confirmed.
    </p>

    <p style="margin-top: 20px; color: #333;">
      <strong>Order Reference:</strong> ${order.payment_reference}<br>
      <strong>Total Amount:</strong> $${Number(order.total).toFixed(2)}
    </p>
  `;

  const customerHtml = getBrandedEmailTemplate({
    title: "Payment Notification Received",
    greeting: `Dear ${customerName},`,
    content: customerContent,
    footerText: "We appreciate your patience while we process your payment.",
  });

  await sendEmail({
    to: customerEmail,
    subject: `Payment Received - Order ${order.payment_reference}`,
    html: customerHtml,
  });
}

/**
 * Send payment verified/receipt email to customer
 */
export async function sendPaymentVerifiedEmail(
  order: OrderWithItems,
  customerEmail: string,
  customerName: string
): Promise<void> {
  const orderItems = order.order_items.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
    price: item.price_at_purchase,
    total: item.price_at_purchase * item.quantity,
  }));

  const orderItemsTable = getOrderItemsTable(orderItems);
  const orderUrl = buildUrl("account", "orders", order.id);

  const content = `
    <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #2e7d32; font-weight: 600; font-size: 16px;">
        ✓ Payment Verified Successfully
      </p>
    </div>

    <p style="margin-top: 20px; color: #333;">
      Great news! Your payment has been verified and your order is now being processed. We will keep you updated on the status of your order.
    </p>

    <div style="margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 18px; font-weight: 600; color: #521540;">
        Order Information
      </h3>
      <p style="margin: 8px 0; color: #333;"><strong>Order ID:</strong> ${order.id}</p>
      <p style="margin: 8px 0; color: #333;"><strong>Payment Reference:</strong> ${order.payment_reference}</p>
    </div>

    <div style="margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 18px; font-weight: 600; color: #521540;">
        Order Receipt
      </h3>
      ${orderItemsTable}
    </div>

    <p style="margin-top: 25px; color: #333;">
      You can view your order details and track its status by clicking the button below.
    </p>
  `;

  const html = getBrandedEmailTemplate({
    title: "Payment Verified - Order Confirmed",
    greeting: `Dear ${customerName},`,
    content,
    buttonText: "View Order Details",
    buttonUrl: orderUrl,
    footerText: "Thank you for choosing KVT Jewellers. We appreciate your business!",
  });

  await sendEmail({
    to: customerEmail,
    subject: `Payment Verified - Order ${order.payment_reference}`,
    html,
  });
}