"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
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

interface OrderDetailProps {
  order: OrderWithDetails;
  currentUserId: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  payment_pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  payment_verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function OrderDetail({ order, currentUserId }: OrderDetailProps) {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "verify" | "complete" | "cancel" | "markPending" | null;
  }>({ open: false, action: null });

  const handleVerifyPayment = async () => {
    setVerifying(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${order.id}/verify-payment`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to verify payment");
        setVerifying(false);
        return;
      }

      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setVerifying(false);
    }
  };

  const handleCompleteOrder = async () => {
    setCompleting(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${order.id}/complete`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to complete order");
        setCompleting(false);
        return;
      }

      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setCompleting(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${order.id}/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to cancel order");
        setCancelling(false);
      }
    } catch (err) {
      setError("Failed to cancel order");
      setCancelling(false);
    }
  };

  const handleMarkPending = async () => {
    setError("");
    try {
      const response = await fetch(`/api/orders/${order.id}/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "payment_pending" }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const getConfirmDialogProps = () => {
    switch (confirmDialog.action) {
      case "verify":
        return {
          title: "Verify Payment",
          description: "Are you sure you want to verify this payment? This will mark the order as payment verified.",
          confirmText: "Verify Payment",
          variant: "default" as const,
          onConfirm: handleVerifyPayment,
        };
      case "complete":
        return {
          title: "Complete Order",
          description: "Are you sure you want to mark this order as completed? This action cannot be undone.",
          confirmText: "Complete Order",
          variant: "default" as const,
          onConfirm: handleCompleteOrder,
        };
      case "cancel":
        return {
          title: "Cancel Order",
          description: "Are you sure you want to cancel this order? This action cannot be undone.",
          confirmText: "Cancel Order",
          variant: "destructive" as const,
          onConfirm: handleCancelOrder,
        };
      case "markPending":
        return {
          title: "Mark Payment Pending",
          description: "Mark this order as payment pending?",
          confirmText: "Mark Pending",
          variant: "default" as const,
          onConfirm: handleMarkPending,
        };
      default:
        return null;
    }
  };

  const confirmProps = getConfirmDialogProps();

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Order ID</label>
              <p className="font-mono text-xs sm:text-sm break-all">{order.id}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Payment Reference</label>
              <p className="font-mono font-semibold text-sm sm:text-base break-all">{order.payment_reference}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge className={statusColors[order.status] || ""}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-xs sm:text-sm">{format(new Date(order.created_at), "PPp")}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Total Amount</label>
              <p className="text-xl sm:text-2xl font-bold">${Number(order.total).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{order.user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p>{order.user.email}</p>
            </div>
            {order.payment?.verified_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Verified</label>
                <p>{format(new Date(order.payment.verified_at), "PPp")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                {(item.metal_price_usd || item.exchange_rate_myr || item.pricing_metadata) && (
                  <div className="ml-24 mt-2 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                    <p className="font-medium text-muted-foreground mb-2">Pricing at Purchase:</p>
                    {item.metal_price_usd && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Metal Price:</span> ${item.metal_price_usd.toFixed(2)}/oz USD
                        {item.pricing_metadata?.metalType && ` (${item.pricing_metadata.metalType})`}
                      </p>
                    )}
                    {(item.exchange_rate_myr || item.exchange_rate_inr) && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Exchange Rates:</span>
                        {item.exchange_rate_myr && ` MYR: ${item.exchange_rate_myr.toFixed(4)}`}
                        {item.exchange_rate_inr && ` INR: ${item.exchange_rate_inr.toFixed(4)}`}
                      </p>
                    )}
                    {item.pricing_metadata?.weight && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Weight:</span> {item.pricing_metadata.weight}g
                        {item.pricing_metadata.purity && ` | Purity: ${(item.pricing_metadata.purity * 1000).toFixed(1)}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Status Management */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Management</CardTitle>
          <CardDescription>
            Update order status and manage workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Status</p>
              <Badge className={`mt-1 ${statusColors[order.status] || ""}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-3 sm:grid-cols-2">
            {order.status === "pending" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setConfirmDialog({ open: true, action: "markPending" })}
              >
                Mark Payment Pending
              </Button>
            )}

            {order.status === "payment_pending" && (
              <Button
                className="w-full gold-gradient-button"
                onClick={() => setConfirmDialog({ open: true, action: "verify" })}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify Payment
                  </>
                )}
              </Button>
            )}

            {order.status === "payment_verified" && (
              <Button
                className="w-full gold-gradient-button"
                onClick={() => setConfirmDialog({ open: true, action: "complete" })}
                disabled={completing}
              >
                {completing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Order
                  </>
                )}
              </Button>
            )}

            {order.status !== "cancelled" && order.status !== "completed" && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setConfirmDialog({ open: true, action: "cancel" })}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </>
                )}
              </Button>
            )}
          </div>

          {order.status === "completed" && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                This order has been completed.
              </AlertDescription>
            </Alert>
          )}

          {order.status === "cancelled" && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                This order has been cancelled.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {confirmProps && (
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ open, action: null })}
          {...confirmProps}
        />
      )}
    </div>
  );
}
