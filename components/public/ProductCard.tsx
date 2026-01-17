"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { categoryImages } from "@/lib/image-placeholders";
import { useCurrency } from "@/lib/currency-context";
import { addToCart, dispatchCartUpdate } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { SignInPromptDialog, type AuthRequiredAction } from "@/components/public/SignInPromptDialog";
import type { Product } from "@/types/products";

interface ProductCardProps {
  product: Product;
  index?: number;
  priceLoading?: boolean;
}

export function ProductCard({ product, index = 0, priceLoading = false }: ProductCardProps) {
  const { formatPrice, currency } = useCurrency();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isAnimatingWishlist, setIsAnimatingWishlist] = useState(false);
  const [isAnimatingCart, setIsAnimatingCart] = useState(false);
  const [isAnimatingBuy, setIsAnimatingBuy] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogAction, setAuthDialogAction] = useState<AuthRequiredAction>("cart");
  
  // Animation controls for each button
  const wishlistControls = useAnimation();
  const cartControls = useAnimation();
  const buyControls = useAnimation();
  
  // Separate controls for icon animations
  const wishlistIconControls = useAnimation();
  const cartIconControls = useAnimation();
  
  // Price is already calculated/converted by the API, just use it directly
  const displayPrice = product.price || null;
  
  // Check if this is the first product in the list
  const isFirstProduct = index === 0;

  // Smooth Instagram/Twitter-like morph animation - faster and smoother
  const morphAnimation = async (controls: any) => {
    // Ensure controls are ready before calling start
    if (!controls || typeof controls.start !== 'function') {
      return;
    }
    try {
      await controls.start({
        scale: 1.2,
        transition: {
          type: "spring",
          stiffness: 600,
          damping: 20,
          mass: 0.5,
        }
      });
      await controls.start({
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 600,
          damping: 20,
          mass: 0.5,
        }
      });
    } catch (error) {
      // Silently handle animation errors (component may have unmounted)
      if (process.env.NODE_ENV === 'development') {
        console.debug('Animation error:', error);
      }
    }
  };

  // Icon-specific morph animation (for heart/cart) - faster and smoother
  const iconMorphAnimation = async (controls: any) => {
    // Ensure controls are ready before calling start
    if (!controls || typeof controls.start !== 'function') {
      return;
    }
    try {
      await controls.start({
        scale: 1.25,
        rotate: -8,
        transition: {
          type: "spring",
          stiffness: 700,
          damping: 18,
          mass: 0.4,
        }
      });
      await controls.start({
        scale: 1,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 700,
          damping: 18,
          mass: 0.4,
        }
      });
    } catch (error) {
      // Silently handle animation errors (component may have unmounted)
      if (process.env.NODE_ENV === 'development') {
        console.debug('Animation error:', error);
      }
    }
  };

  // Check authentication
  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(!!data.user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Check wishlist status
  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
    
    const handleWishlistUpdate = () => {
      const newState = isInWishlist(product.id);
      setIsWishlisted(newState);
      // Animate icon when wishlist state changes
      if (newState && wishlistIconControls && typeof wishlistIconControls.start === 'function') {
        try {
          wishlistIconControls.start({
            scale: 1.2,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 15,
            }
          }).then(() => {
            if (wishlistIconControls && typeof wishlistIconControls.start === 'function') {
              wishlistIconControls.start({
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                }
              }).catch(() => {
                // Silently handle errors if component unmounted
              });
            }
          }).catch(() => {
            // Silently handle errors if component unmounted
          });
        } catch (error) {
          // Silently handle animation errors
          if (process.env.NODE_ENV === 'development') {
            console.debug('Wishlist animation error:', error);
          }
        }
      }
    };
    
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [product.id, wishlistIconControls]);

  // Animate buttons on first product after a delay
  useEffect(() => {
    if (!isFirstProduct || hasAnimated) return;

    let isMounted = true;

    const startAnimation = async () => {
      // Wait 1.5 seconds before starting animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if component is still mounted
      if (!isMounted) return;

      // Animate wishlist button first with morph animation
      setIsAnimatingWishlist(true);
      await iconMorphAnimation(wishlistControls);
      if (!isMounted) return;
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsAnimatingWishlist(false);

      // Wait a bit, then animate cart button
      if (!isMounted) return;
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsAnimatingCart(true);
      await iconMorphAnimation(cartControls);
      if (!isMounted) return;
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsAnimatingCart(false);

      // Wait a bit, then animate buy button
      if (!isMounted) return;
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsAnimatingBuy(true);
      await morphAnimation(buyControls);
      if (!isMounted) return;
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsAnimatingBuy(false);

      if (isMounted) {
        setHasAnimated(true);
      }
    };

    startAnimation();
    
    return () => {
      isMounted = false;
    };
  }, [isFirstProduct, hasAnimated, wishlistControls, cartControls, buyControls]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated === false) {
      setAuthDialogAction("wishlist");
      setShowAuthDialog(true);
      return;
    }
    if (isAuthenticated === null) return; // still loading

    // Trigger morph animation on click
    setIsAnimatingWishlist(true);
    iconMorphAnimation(wishlistControls).then(() => {
      setIsAnimatingWishlist(false);
    });

    const added = toggleWishlist(product.id);
    setIsWishlisted(added);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated === false) {
      setAuthDialogAction("cart");
      setShowAuthDialog(true);
      return;
    }
    if (isAuthenticated === null) return; // still loading

    // Trigger morph animation on click
    setIsAnimatingCart(true);
    iconMorphAnimation(cartControls).then(() => {
      setIsAnimatingCart(false);
    });

    // If product has variants or no price, navigate to detail page
    if (product.hasVariants || !displayPrice) {
      router.push(`/product/${product.id}`);
      return;
    }

    setAddingToCart(true);
    
    try {
      // Try to get the latest price with current currency
      const response = await fetch(`/api/products/${product.id}/calculate-price?currency=${currency}`);
      if (response.ok) {
        const data = await response.json();
        addToCart({
          productId: product.id,
          name: product.name,
          price: data.price,
          image: product.images?.[0] || categoryImages[product.category] || categoryImages.other,
        }, 1);
      } else {
        addToCart({
          productId: product.id,
          name: product.name,
          price: displayPrice,
          image: product.images?.[0] || categoryImages[product.category] || categoryImages.other,
        }, 1);
      }
    } catch (error) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: product.images?.[0] || categoryImages[product.category] || categoryImages.other,
      }, 1);
    }
    
    dispatchCartUpdate();
    
    // Animate icon when adding to cart
    setIsAnimatingCart(true);
    cartIconControls.start({
      scale: 1.2,
      transition: {
        type: "spring",
        stiffness: 700,
        damping: 18,
        mass: 0.4,
      }
    }).then(() => {
      cartIconControls.start({
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 700,
          damping: 18,
          mass: 0.4,
        }
      });
      setTimeout(() => setIsAnimatingCart(false), 200);
    });
    
    setAddingToCart(false);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated === false) {
      setAuthDialogAction("buy");
      setShowAuthDialog(true);
      return;
    }
    if (isAuthenticated === null) return; // still loading

    // Trigger morph animation on click
    setIsAnimatingBuy(true);
    morphAnimation(buyControls).then(() => {
      setIsAnimatingBuy(false);
    });

    router.push(`/product/${product.id}`);
  };

  return (
    <>
      <SignInPromptDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        action={authDialogAction}
        returnPath={authDialogAction === "buy" ? `/product/${product.id}` : undefined}
      />
      <Card className="group overflow-hidden bg-card-level-2 shadow-card transition-shadow duration-200 hover:shadow-card-elevated">
      <div className="flex h-full flex-col">
        <Link href={`/product/${product.id}`} className="flex-shrink-0">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <Image
              src={
                product.images && product.images.length > 0
                  ? product.images[0]
                  : categoryImages[product.category] || categoryImages.other
              }
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              loading="lazy"
              unoptimized={product.images && product.images.length > 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {product.purity && (
              <Badge className="absolute right-2 top-2 bg-white/95 text-brand-700 text-xs font-medium">
                {product.purity}
              </Badge>
            )}
          </div>
        </Link>
        <CardContent className="p-4 flex-1 flex flex-col gap-3">
          <div className="flex-1">
            <Link href={`/product/${product.id}`}>
              <h3 className="mb-2 font-serif text-base font-semibold line-clamp-2 group-hover:text-brand-600 transition-colors duration-200 min-h-[2.5rem]">
                {product.name}
              </h3>
            </Link>
            <p className="mb-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
          
          {/* Price and Weight - Stacked on mobile to prevent overflow */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              {priceLoading ? (
                <div className="relative h-6 flex-1 overflow-hidden rounded-md">
                  {/* Base golden gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 via-amber-300/50 to-amber-200/30 dark:from-amber-700/40 dark:via-amber-600/60 dark:to-amber-700/40" />
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/60 to-transparent dark:via-amber-300/40 animate-shimmer" />
                  {/* Secondary shimmer for depth */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-50/40 to-transparent dark:via-amber-200/30 animate-shimmer-delayed" />
                </div>
              ) : (
                <span className="font-semibold text-base gold-gradient-text flex-1 min-w-0 truncate">
                  {displayPrice !== null 
                    ? (product.hasVariants ? `From ${formatPrice(displayPrice)}` : formatPrice(displayPrice))
                    : "Price on request"}
                </span>
              )}
              {product.weight && (
                <Badge variant="outline" className="text-xs shrink-0 font-medium whitespace-nowrap">
                  {product.weight}g
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <motion.div
              animate={wishlistControls}
              className="shrink-0"
            >
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 relative overflow-visible transition-all duration-300 ${
                  isAnimatingWishlist 
                    ? "bg-amber-500/20 dark:bg-amber-500/30 shadow-lg shadow-amber-500/50" 
                    : ""
                }`}
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <motion.div
                  animate={wishlistIconControls}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Heart className={`h-4 w-4 transition-all duration-300 ${
                    isAnimatingWishlist
                      ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                      : isWishlisted 
                      ? "fill-red-500 text-red-500" 
                      : "text-foreground"
                  }`} />
                </motion.div>
              </Button>
            </motion.div>
            <motion.div
              animate={cartControls}
              className="shrink-0"
            >
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 relative overflow-visible transition-all duration-300 ${
                  isAnimatingCart 
                    ? "bg-amber-500/20 dark:bg-amber-500/30 shadow-lg shadow-amber-500/50" 
                    : ""
                }`}
                onClick={handleAddToCart}
                disabled={addingToCart || !displayPrice}
                aria-label="Add to cart"
              >
                <motion.div
                  animate={cartIconControls}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ShoppingCart className={`h-4 w-4 transition-all duration-300 ${
                    isAnimatingCart
                      ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                      : "text-foreground"
                  }`} />
                </motion.div>
              </Button>
            </motion.div>
            <motion.div
              animate={buyControls}
              className="flex-1"
            >
              <Button
                variant="default"
                size="sm"
                className={`w-full relative overflow-visible transition-all duration-300 ${
                  isAnimatingBuy
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white shadow-lg shadow-amber-500/50"
                    : ""
                }`}
                onClick={handleBuyNow}
              >
                <motion.span
                  className="flex items-center justify-center"
                  animate={buyControls}
                >
                  <span className={`hidden sm:inline transition-colors duration-300 ${
                    isAnimatingBuy ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" : ""
                  }`}>Buy Now</span>
                  <span className={`sm:hidden transition-colors duration-300 ${
                    isAnimatingBuy ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" : ""
                  }`}>Buy</span>
                  <ArrowRight className={`ml-1 h-3 w-3 transition-all duration-300 ${
                    isAnimatingBuy ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" : ""
                  }`} />
                </motion.span>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </div>
    </Card>
    </>
  );
}
