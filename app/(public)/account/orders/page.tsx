import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/auth/customer";
import { getUserOrders } from "@/lib/db/orders";
import { AccountNav } from "@/components/public/AccountNav";
import { OrderCard } from "@/components/public/OrderCard";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export const dynamic = 'force-dynamic'; // This page requires authentication, so it can't be statically generated

export default async function OrdersPage() {
  const user = await getCustomerUser();

  if (!user) {
    redirect("/login?from=/account/orders");
  }

  const orders = await getUserOrders(user.id);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">My Orders</h1>
        <p className="mt-2 text-muted-foreground">
          View and track your order history
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                <p className="text-center text-muted-foreground mb-4">
                  Start shopping to see your orders here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}