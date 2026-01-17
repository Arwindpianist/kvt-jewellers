"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { getCart, updateCartItemQuantity, removeFromCart, clearCart, dispatchCartUpdate } from "@/lib/cart";
import type { CartItem } from "@/types/cart";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(getCart());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication
    fetch("/api/auth/customer/me")
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(!!data.user);
        setCheckingAuth(false);
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, []);

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    const updatedCart = updateCartItemQuantity(productId, quantity, variantId);
    setCart(updatedCart);
    dispatchCartUpdate();
  };

  const removeItem = (productId: string, variantId?: string) => {
    const updatedCart = removeFromCart(productId, variantId);
    setCart(updatedCart);
    dispatchCartUpdate();
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?from=/cart");
      return;
    }
    router.push("/checkout");
  };

  if (checkingAuth) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold md:text-5xl">Shopping Cart</h1>
          <p className="mt-2 text-muted-foreground">
            Review your items before checkout
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign in to view your cart</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create an account or sign in to add items to your cart and complete your purchase.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild className="gold-gradient-button">
                <Link href="/login?from=/cart">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register?from=/cart">Sign up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Shopping Cart</h1>
        <p className="mt-2 text-muted-foreground">
          Review your items before checkout
        </p>
      </div>

      {cart.items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products to your cart
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <Card key={`${item.productId}-${item.variantId || index}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted mx-auto sm:mx-0">
                      <Image
                        src={item.image || "/placeholder-jewelry.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg mb-1 break-words">{item.name}</h3>
                      {item.variantOptions && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {item.variantOptions.size && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Size: {item.variantOptions.size}</span>
                          )}
                          {item.variantOptions.finish && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Finish: {item.variantOptions.finish}</span>
                          )}
                          {item.variantOptions.metalType && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Metal: {item.variantOptions.metalType}</span>
                          )}
                          {item.variantOptions.designStyle && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Style: {item.variantOptions.designStyle}</span>
                          )}
                          {item.variantOptions.stoneType && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Stone: {item.variantOptions.stoneType}</span>
                          )}
                        </div>
                      )}
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        ${item.price.toFixed(2)} each
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1;
                              updateQuantity(item.productId, qty, item.variantId);
                            }}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-lg sm:text-xl">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full gold-gradient-button mb-2"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}