import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/auth/customer";
import { getOrderById } from "@/lib/db/orders";
import { AccountNav } from "@/components/public/AccountNav";
import { OrderReceipt } from "@/components/public/OrderReceipt";
import { Card, CardContent } from "@/components/ui/card";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const user = await getCustomerUser();
  const { orderId } = await params;

  if (!user) {
    redirect("/login?from=/account/orders/" + orderId);
  }

  const order = await getOrderById(orderId, user.id);

  if (!order) {
    redirect("/account/orders");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Order Details</h1>
        <p className="mt-2 text-muted-foreground">
          Order #{order.payment_reference}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          <OrderReceipt order={order} />
        </div>
      </div>
    </div>
  );
}