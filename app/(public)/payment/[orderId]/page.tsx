"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Copy, QrCode } from "lucide-react";
import { getCustomerUser } from "@/lib/auth/customer";

interface Order {
  id: string;
  status: string;
  total: number;
  payment_reference: string;
  created_at: string;
  order_items: Array<{
    id: string;
    product: {
      name: string;
      image: string | null;
    };
    quantity: number;
    price_at_purchase: number;
  }>;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check authentication
    fetch("/api/auth/customer/me")
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.user) {
          router.push("/login?from=/payment/" + orderId);
          return;
        }

        // Fetch order
        const orderRes = await fetch(`/api/orders/${orderId}`);
        const orderData = await orderRes.json();

        if (!orderRes.ok || !orderData.order) {
          setError("Order not found");
          setLoading(false);
          return;
        }

        setOrder(orderData.order);

        // Generate QR code
        const qrRes = await fetch(`/api/orders/${orderId}/qr-code`);
        const qrData = await qrRes.json();

        if (qrRes.ok && qrData.qrCode) {
          setQrCode(qrData.qrCode);
        }

        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load order");
        setLoading(false);
      });
  }, [orderId, router]);

  const handleMarkAsPaid = async () => {
    setMarkingPaid(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderId}/mark-paid`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to mark payment");
        setMarkingPaid(false);
        return;
      }

      // Redirect to order confirmation
      router.push(`/account/orders/${orderId}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setMarkingPaid(false);
    }
  };

  const copyReference = () => {
    if (order) {
      navigator.clipboard.writeText(order.payment_reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const bankName = process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || "Your Bank";
  const accountNumber = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER || "1234567890";
  const accountHolder = process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER || "KVT Jewellers";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Payment Instructions</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your payment to confirm your order
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Order #{order.id.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.product.image || "/placeholder-jewelry.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base break-words">{item.product.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.quantity} × ${item.price_at_purchase.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-base sm:text-lg">
                  <span>Total Amount</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Transfer the amount using the details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                <p className="text-lg font-semibold">{bankName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                <p className="text-lg font-semibold">{accountNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Holder</label>
                <p className="text-lg font-semibold">{accountHolder}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Reference</label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold font-mono">{order.payment_reference}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyReference}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {copied && (
                    <span className="text-sm text-green-600">Copied!</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Include this reference when making the transfer
                </p>
              </div>
            </div>

            {qrCode && (
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <QrCode className="h-5 w-5 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Scan QR Code</p>
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 bg-white rounded-lg p-2">
                  <Image
                    src={qrCode}
                    alt="Payment QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full gold-gradient-button"
              onClick={handleMarkAsPaid}
              disabled={markingPaid || order.status !== "pending"}
            >
              {markingPaid ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  I Have Paid
                </>
              )}
            </Button>

            {order.status !== "pending" && (
              <Alert>
                <AlertDescription>
                  {order.status === "payment_pending" && "Payment is being verified"}
                  {order.status === "payment_verified" && "Payment has been verified"}
                  {order.status === "completed" && "Order completed"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}