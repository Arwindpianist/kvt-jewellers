"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { HoverCard } from "@/components/ui/hover-card";
import { ArrowLeft, CheckCircle2, Shield, Award, ShoppingCart, Loader2 } from "lucide-react";
import type { Product } from "@/types/products";
import { addToCart, dispatchCartUpdate } from "@/lib/cart";

interface ProductDetailContentProps {
  product: Product;
}

import { categoryImages } from "@/lib/image-placeholders";

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(product.price || null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceMetadata, setPriceMetadata] = useState<any>(null);

  // Fetch current price on component mount
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      if (!product.weight || !product.purity) {
        // If product doesn't have weight/purity, use static price
        return;
      }

      setLoadingPrice(true);
      try {
        const response = await fetch(`/api/products/${product.id}/calculate-price?currency=USD`);
        if (response.ok) {
          const data = await response.json();
          setCurrentPrice(data.price);
          setPriceMetadata(data.metadata);
        }
      } catch (error) {
        console.error("Failed to fetch current price:", error);
        // Fallback to static price
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchCurrentPrice();
  }, [product.id, product.weight, product.purity]);

  const formatPrice = (price?: number | null) => {
    if (!price) return "Price on request";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleAddToCart = async () => {
    // Use current calculated price if available, otherwise fallback to static price
    const priceToUse = currentPrice || product.price;
    
    if (!priceToUse) {
      alert("Price not available. Please contact us for pricing information.");
      return;
    }

    setAddingToCart(true);
    
    // If we have calculated price, fetch it again to ensure we have latest metadata
    if (product.weight && product.purity) {
      try {
        const response = await fetch(`/api/products/${product.id}/calculate-price?currency=USD`);
        if (response.ok) {
          const data = await response.json();
          addToCart({
            productId: product.id,
            name: product.name,
            price: data.price,
            image: product.images[0] || "/placeholder-jewelry.jpg",
          }, 1);
        } else {
          // Fallback to static price
          addToCart({
            productId: product.id,
            name: product.name,
            price: product.price!,
            image: product.images[0] || "/placeholder-jewelry.jpg",
          }, 1);
        }
      } catch (error) {
        // Fallback to static price
        addToCart({
          productId: product.id,
          name: product.name,
          price: product.price!,
          image: product.images[0] || "/placeholder-jewelry.jpg",
        }, 1);
      }
    } else {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price!,
        image: product.images[0] || "/placeholder-jewelry.jpg",
      }, 1);
    }
    
    dispatchCartUpdate();
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setAddingToCart(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-6">
          <AnimatedButton asChild variant="ghost" className="text-brand-600 hover:text-brand-700">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </AnimatedButton>
        </div>
      </FadeIn>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Product Image */}
        <AnimatedSection>
          <HoverCard>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={categoryImages[product.category] || categoryImages.jewellery}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {product.purity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Badge className="absolute right-4 top-4 bg-white/95 text-brand-700 text-sm px-3 py-1">
                    {product.purity} Pure
                  </Badge>
                </motion.div>
              )}
            </div>
          </HoverCard>
        </AnimatedSection>

        {/* Product Details */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col">
            <Badge variant="outline" className="mb-4 w-fit border-brand-300 text-brand-700">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Badge>
            <h1 className="mb-4 font-serif text-3xl font-bold md:text-5xl">{product.name}</h1>
            
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                {loadingPrice ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                    <span className="text-lg text-muted-foreground">Calculating price...</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl md:text-4xl font-semibold gold-gradient-text">
                      {formatPrice(currentPrice)}
                    </span>
                    {currentPrice && currentPrice !== product.price && (
                      <Badge variant="outline" className="text-xs">
                        Live Price
                      </Badge>
                    )}
                  </>
                )}
              </div>
              {priceMetadata && (
                <p className="text-xs text-muted-foreground mt-2">
                  Based on current {priceMetadata.metalType} price: ${priceMetadata.metalPriceUSD.toFixed(2)}/oz
                </p>
              )}
            </motion.div>

            <Separator className="my-6" />

            <Card className="mb-6 border-brand-200">
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
                  <Award className="h-5 w-5 text-brand-600" />
                  Product Details
                </h2>
                <dl className="space-y-3">
                  {product.weight && (
                    <motion.div
                      className="flex justify-between border-b pb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <dt className="text-muted-foreground">Weight</dt>
                      <dd className="font-semibold">{product.weight}g</dd>
                    </motion.div>
                  )}
                  {product.purity && (
                    <motion.div
                      className="flex justify-between border-b pb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <dt className="text-muted-foreground">Purity</dt>
                      <dd className="font-semibold">{product.purity}</dd>
                    </motion.div>
                  )}
                  <motion.div
                    className="flex justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-semibold capitalize">{product.category}</dd>
                  </motion.div>
                </dl>
              </CardContent>
            </Card>

            <div className="mb-6">
              <h2 className="mb-3 font-serif text-xl font-semibold">Description</h2>
              <p className="leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            <motion.div
              className="mb-6 rounded-lg bg-brand-50 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-brand-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Authentic Quality Guaranteed</p>
                  <p className="text-xs text-muted-foreground">
                    All products are certified and come with authenticity guarantee
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="mt-auto space-y-3">
              {showSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  {product.name} added to cart!
                </div>
              )}
              <AnimatedButton
                size="lg"
                className="w-full gold-gradient-button"
                onClick={handleAddToCart}
                disabled={addingToCart || (!currentPrice && !product.price) || loadingPrice}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {addingToCart ? "Adding..." : loadingPrice ? "Calculating Price..." : "Add to Cart"}
              </AnimatedButton>
              <AnimatedButton asChild size="lg" variant="outline" className="w-full">
                <Link href="/live-rate">View Current Gold Rates</Link>
              </AnimatedButton>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

