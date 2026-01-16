import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import type { OrderWithItems } from "@/lib/db/orders";

interface OrderReceiptProps {
  order: OrderWithItems;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  payment_pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  payment_verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function OrderReceipt({ order }: OrderReceiptProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Order #{order.payment_reference}</CardDescription>
            </div>
            <Badge className={statusColors[order.status] || ""}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Order Date</label>
              <p>{format(new Date(order.created_at), "PPp")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Reference</label>
              <p className="font-mono">{order.payment_reference}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="pb-4 border-b last:border-0">
                <div className="flex gap-4 mb-3">
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.product.image || "/placeholder-jewelry.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ${item.price_at_purchase.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.price_at_purchase * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
                {/* Pricing Information */}
                {(item.metal_price_usd || item.exchange_rate_myr || (item as any).pricing_metadata) && (
                  <div className="ml-24 mt-2 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                    <p className="font-medium text-muted-foreground mb-2">Price at Purchase:</p>
                    {item.metal_price_usd && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Metal Price:</span> ${item.metal_price_usd.toFixed(2)}/oz USD
                        {(item as any).pricing_metadata?.metalType && ` (${(item as any).pricing_metadata.metalType})`}
                      </p>
                    )}
                    {(item.exchange_rate_myr || item.exchange_rate_inr) && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Exchange Rates:</span>
                        {item.exchange_rate_myr && ` MYR: ${item.exchange_rate_myr.toFixed(4)}`}
                        {item.exchange_rate_inr && ` INR: ${item.exchange_rate_inr.toFixed(4)}`}
                      </p>
                    )}
                    {(item as any).pricing_metadata?.weight && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Weight:</span> {(item as any).pricing_metadata.weight}g
                        {(item as any).pricing_metadata.purity && ` | Purity: ${((item as any).pricing_metadata.purity * 1000).toFixed(1)}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.status === "pending" && (
        <Card>
          <CardContent className="pt-6">
            <Button asChild className="w-full gold-gradient-button">
              <Link href={`/payment/${order.id}`}>Complete Payment</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}