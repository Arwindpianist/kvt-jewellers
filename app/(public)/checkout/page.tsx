"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import { getCart, clearCart } from "@/lib/cart";
import type { CartItem } from "@/types/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState(getCart());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication
    fetch("/api/auth/customer/me")
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(!!data.user);
        setCheckingAuth(false);
        if (!data.user) {
          router.push("/login?from=/checkout");
        }
      })
      .catch(() => {
        setCheckingAuth(false);
        router.push("/login?from=/checkout");
      });
  }, [router]);

  useEffect(() => {
    // Redirect if cart is empty
    if (!checkingAuth && cart.items.length === 0) {
      router.push("/cart");
    }
  }, [cart, checkingAuth, router]);

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First, calculate current prices based on metal prices and exchange rates
      const priceResponse = await fetch("/api/orders/calculate-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          currency: "USD", // Default currency, can be made configurable
        }),
      });

      if (!priceResponse.ok) {
        const priceData = await priceResponse.json();
        setError(priceData.error || "Failed to calculate prices. Please try again.");
        setLoading(false);
        return;
      }

      const { items: pricedItems, total } = await priceResponse.json();

      // Create order with calculated prices and metadata
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: pricedItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            metadata: item.metadata,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // Clear cart
      clearCart();

      // Redirect to payment page
      router.push(`/payment/${data.order.id}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Review your order and proceed to payment
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.image || "/placeholder-jewelry.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">
                    You will receive payment instructions after order confirmation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full gold-gradient-button"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}