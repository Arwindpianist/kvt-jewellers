"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Database } from "@/types/database";

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderWithDetails = OrderRow & {
  order_items: Array<{
    id: string;
    product: {
      name: string;
      image: string | null;
    };
    quantity: number;
    price_at_purchase: number;
    metal_price_usd?: number | null;
    exchange_rate_myr?: number | null;
    exchange_rate_inr?: number | null;
    pricing_metadata?: any;
  }>;
  payment: {
    id: string;
    status: string;
    verified_by: string | null;
    verified_at: string | null;
  } | null;
  user: {
    name: string;
    email: string;
  };
};

interface OrderListProps {
  orders: OrderWithDetails[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  payment_pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  payment_verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <span className="text-lg sm:text-xl">Order #{order.payment_reference}</span>
                  <Badge className={statusColors[order.status] || ""}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm break-words">
                  {order.user.name} ({order.user.email})
                </CardDescription>
                <CardDescription className="text-xs sm:text-sm">
                  {format(new Date(order.created_at), "PPp")}
                </CardDescription>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-bold">${Number(order.total).toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">Items:</h4>
                <ul className="space-y-1">
                  {order.order_items.map((item) => (
                    <li key={item.id} className="text-xs sm:text-sm text-muted-foreground">
                      {item.product.name} × {item.quantity} = ${(item.price_at_purchase * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                  <Link href={`/staff/orders/${order.id}`}>View Details</Link>
                </Button>
                {order.status === "payment_pending" && (
                  <Button asChild size="sm" className="gold-gradient-button w-full sm:w-auto">
                    <Link href={`/staff/orders/${order.id}`}>Verify Payment</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}