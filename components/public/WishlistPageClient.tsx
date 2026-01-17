"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { ProductCard } from "@/components/public/ProductCard";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { getWishlistItems } from "@/lib/wishlist";
import type { Product } from "@/types/products";

export function WishlistPageClient() {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadWishlist = async () => {
      const items = getWishlistItems();
      const productIds = items.map((item) => item.productId);
      setWishlistItems(productIds);

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch products by IDs
        const productPromises = productIds.map(async (id) => {
          try {
            const response = await fetch(`/api/products/${id}`);
            if (response.ok) {
              const data = await response.json();
              return data.product;
            }
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
          }
          return null;
        });

        const fetchedProducts = await Promise.all(productPromises);
        setProducts(fetchedProducts.filter((p) => p !== null));
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlist();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [isAuthenticated]);

  if (checkingAuth || (isAuthenticated && loading)) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <FadeIn>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-8 w-8 text-brand-600" />
                <h1 className="font-serif text-3xl font-bold md:text-4xl">My Wishlist</h1>
              </div>
              <p className="text-muted-foreground">
                Sign in to view and manage your wishlist.
              </p>
            </div>
          </FadeIn>
          <Card className="border-brand-200">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">Sign in to view your wishlist</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create an account or sign in to save products to your wishlist and access them across devices.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild className="gold-gradient-button">
                  <Link href="/login?from=/wishlist">Sign in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/register?from=/wishlist">Sign up</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-brand-600" />
              <h1 className="font-serif text-3xl font-bold md:text-4xl">My Wishlist</h1>
            </div>
            <p className="text-muted-foreground">
              {products.length === 0
                ? "Your wishlist is empty. Start adding products you love!"
                : `You have ${products.length} ${products.length === 1 ? "item" : "items"} in your wishlist.`}
            </p>
          </div>
        </FadeIn>

        {products.length === 0 ? (
          <AnimatedSection>
            <Card className="border-brand-200">
              <CardContent className="p-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h2>
                <p className="text-muted-foreground mb-6">
                  Start adding products you love to your wishlist!
                </p>
                <Button asChild className="gold-gradient-button">
                  <Link href="/products">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Products
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
