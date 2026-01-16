import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { OrderWithItems } from "@/lib/db/orders";

interface OrderCardProps {
  order: OrderWithItems;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  payment_pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  payment_verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Order #{order.payment_reference}
              <Badge className={statusColors[order.status] || ""}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Placed on {format(new Date(order.created_at), "PPp")}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">${Number(order.total).toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/account/orders/${order.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}