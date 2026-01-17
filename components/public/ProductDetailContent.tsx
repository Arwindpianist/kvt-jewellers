"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { 
  ArrowLeft, ShoppingCart, Loader2, CheckCircle2, Shield, Award, Truck, Heart, Share2, Info,
  TrendingUp, Sparkles, Star, HelpCircle, Package, Clock, DollarSign, Gift
} from "lucide-react";
import type { Product, ProductVariant } from "@/types/products";
import { addToCart, dispatchCartUpdate } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { SignInPromptDialog, type AuthRequiredAction } from "@/components/public/SignInPromptDialog";
import { categoryImages } from "@/lib/image-placeholders";
import { categoryConfig, metalTypes, purityOptions, designStyles, finishOptions, stoneTypes } from "@/lib/product-categories";
import { getCategoryUrl } from "@/lib/category-utils";
import { ImageCarousel } from "@/components/staff/ImageCarousel";
import { ProductCard } from "@/components/public/ProductCard";
import { ProductReviews } from "@/components/public/ProductReviews";
import { PriceAnalytics } from "@/components/public/PriceAnalytics";
import { useCurrency } from "@/lib/currency-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductDetailContentProps {
  product: Product;
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(product.price || null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceMetadata, setPriceMetadata] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<"description" | "details" | "shipping" | "care">("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAnimatingWishlist, setIsAnimatingWishlist] = useState(false);
  const [isAnimatingCart, setIsAnimatingCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogAction, setAuthDialogAction] = useState<AuthRequiredAction>("wishlist");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantOptions, setVariantOptions] = useState({
    size: "",
    finish: "",
    metalType: "",
    designStyle: "",
    stoneType: "",
  });
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Animation controls for buttons
  const wishlistButtonRef = useRef<HTMLButtonElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const wishlistIconControls = useAnimation();
  const cartIconControls = useAnimation();

  const categoryInfo = categoryConfig[product.category];
  const categoryLabel = categoryInfo?.label || product.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const isInvestment = categoryInfo?.group === "investment";

  // Get currency context - must be declared before useEffects that use it
  const { currency, formatPrice: formatCurrencyPrice } = useCurrency();

  // Smooth Instagram/Twitter-like morph animation - faster and smoother
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
      setIsWishlisted(isInWishlist(product.id));
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [product.id]);

  // Fetch related products (same category)
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${product.category}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          const related = (data.products || [])
            .filter((p: Product) => p.id !== product.id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoadingRelated(false);
      }
    };
    fetchRelatedProducts();
  }, [product.id, product.category]);

  // Fetch similar products (same group, different category)
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    const fetchSimilarProducts = async () => {
      try {
        const groupParam = categoryInfo?.group === "investment" ? "investment" : 
                          categoryInfo?.group === "jewelry" ? "jewelry" : null;
        
        if (!groupParam) {
          if (isMounted) {
            setLoadingSimilar(false);
          }
          return;
        }
        
        const response = await fetch(`/api/products?category=${groupParam}&limit=20`, {
          signal: abortController.signal,
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            const similar = (data.products || [])
              .filter((p: Product) => 
                p.id !== product.id && 
                p.category !== product.category &&
                (p.metalType === product.metalType || 
                 (p.price && product.price && Math.abs(p.price - product.price) / product.price < 0.3))
              )
              .slice(0, 4);
            setSimilarProducts(similar);
          }
        }
      } catch (error) {
        // Only log in development and ignore abort errors
        if (process.env.NODE_ENV === 'development' && error instanceof Error && error.name !== 'AbortError') {
          console.error("Error fetching similar products:", error);
        }
      } finally {
        if (isMounted) {
          setLoadingSimilar(false);
        }
      }
    };
    fetchSimilarProducts();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [product.id, product.category, product.metalType, product.price, categoryInfo]);

  // Fetch variants if product has variants
  useEffect(() => {
    if (product.hasVariants) {
      setLoadingVariants(true);
      fetch(`/api/products/${product.id}/variants`)
        .then((res) => res.json())
        .then((data) => {
          setVariants(data.variants || []);
          // Select first variant by default
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
            setVariantOptions({
              size: data.variants[0].size || "",
              finish: data.variants[0].finish || "",
              metalType: data.variants[0].metalType || "",
              designStyle: data.variants[0].designStyle || "",
              stoneType: data.variants[0].stoneType || "",
            });
          }
        })
        .catch((error) => {
          console.error("Failed to fetch variants:", error);
        })
        .finally(() => setLoadingVariants(false));
    }
  }, [product.id, product.hasVariants]);

  // Calculate price when variant selection changes
  useEffect(() => {
    const calculatePrice = async () => {
      if (product.hasVariants) {
        if (!selectedVariant && variants.length > 0) {
          return; // Wait for variant selection
        }
        setLoadingPrice(true);
        try {
          const response = await fetch(`/api/products/${product.id}/calculate-price`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              currency,
              variantId: selectedVariant?.id,
              variantOptions: selectedVariant ? undefined : variantOptions,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setCurrentPrice(data.price);
            setPriceMetadata(data.metadata);
          }
        } catch (error) {
          console.error("Failed to calculate price:", error);
        } finally {
          setLoadingPrice(false);
        }
      } else {
        // No variants - use existing logic
        if (!product.weight || !product.purity) {
          return;
        }
        setLoadingPrice(true);
        try {
          const response = await fetch(`/api/products/${product.id}/calculate-price?currency=${currency}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentPrice(data.price);
            setPriceMetadata(data.metadata);
          }
        } catch (error) {
          console.error("Failed to fetch current price:", error);
        } finally {
          setLoadingPrice(false);
        }
      }
    };

    calculatePrice();
  }, [product.id, product.weight, product.purity, currency, product.hasVariants, selectedVariant, variantOptions, variants.length]);

  const formatPrice = (price?: number | null) => {
    if (!price) return "Price on request";
    return formatCurrencyPrice(price);
  };

  const handleAddToCart = async () => {
    // Trigger morph animation on click
    setIsAnimatingCart(true);
    iconMorphAnimation(cartIconControls).then(() => {
      setTimeout(() => setIsAnimatingCart(false), 200);
    });
    
    const priceToUse = currentPrice || product.price;
    
    if (!priceToUse) {
      alert("Price not available. Please contact us for pricing information.");
      return;
    }

    setAddingToCart(true);
    
    // Calculate price with variant if applicable
    try {
      let priceToAdd = priceToUse;
      
      if (product.hasVariants && selectedVariant) {
        const response = await fetch(`/api/products/${product.id}/calculate-price`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currency,
            variantId: selectedVariant.id,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          priceToAdd = data.price;
        }
      } else if (product.weight && product.purity) {
        const response = await fetch(`/api/products/${product.id}/calculate-price?currency=${currency}`);
        if (response.ok) {
          const data = await response.json();
          priceToAdd = data.price;
        }
      }

      addToCart({
        productId: product.id,
        name: product.name,
        price: priceToAdd,
        image: product.images[0] || "/placeholder-jewelry.jpg",
        variantId: selectedVariant?.id,
        variantOptions: selectedVariant ? {
          size: selectedVariant.size,
          finish: selectedVariant.finish,
          metalType: selectedVariant.metalType,
          designStyle: selectedVariant.designStyle,
          stoneType: selectedVariant.stoneType,
        } : undefined,
      }, 1);
    } catch (error) {
      console.error("Error adding to cart", error);
      addToCart({
        productId: product.id,
        name: product.name,
        price: priceToUse,
        image: product.images[0] || "/placeholder-jewelry.jpg",
        variantId: selectedVariant?.id,
      }, 1);
    }
    
    dispatchCartUpdate();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setAddingToCart(false);
  };

  const handleWishlistToggle = async () => {
    if (isAuthenticated === false) {
      setAuthDialogAction("wishlist");
      setShowAuthDialog(true);
      return;
    }
    if (isAuthenticated === null) return;

    // Trigger morph animation on click
    setIsAnimatingWishlist(true);
    iconMorphAnimation(wishlistIconControls).then(() => {
      setTimeout(() => setIsAnimatingWishlist(false), 200);
    });

    const added = toggleWishlist(product.id);
    setIsWishlisted(added);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} - ${product.description?.substring(0, 100)}...`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        } catch (clipboardError) {
          console.error("Failed to copy to clipboard:", clipboardError);
        }
      }
    }
  };

  // Get product images or fallback
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [categoryImages[product.category] || categoryImages.other];

  // Build product details based on available fields
  const productDetails: Array<{ label: string; value: string | number }> = [];
  
  if (product.metalType) {
    productDetails.push({ 
      label: "Metal Type", 
      value: product.metalType.charAt(0).toUpperCase() + product.metalType.slice(1) 
    });
  }
  
  if (product.weight) {
    productDetails.push({ label: "Weight", value: `${product.weight}g` });
  }
  
  if (product.purity) {
    productDetails.push({ label: "Purity", value: product.purity });
  }
  
  if (product.size) {
    productDetails.push({ label: categoryInfo?.sizeLabel || "Size", value: product.size });
  }
  
  if (product.dimensions) {
    productDetails.push({ label: "Dimensions", value: product.dimensions });
  }
  
  if (product.stoneType && product.stoneType !== "None") {
    const stoneInfo = product.stoneCount 
      ? `${product.stoneType} (${product.stoneCount} ${product.stoneCount === 1 ? 'stone' : 'stones'})`
      : product.stoneType;
    productDetails.push({ label: "Stone", value: stoneInfo });
  }
  
  if (product.designStyle) {
    productDetails.push({ label: "Design Style", value: product.designStyle });
  }
  
  if (product.finish) {
    productDetails.push({ label: "Finish", value: product.finish });
  }

  // Benefits based on product type
  const benefits = isInvestment
    ? [
        { icon: TrendingUp, title: "Investment Value", desc: "Precious metals retain value over time" },
        { icon: Shield, title: "Portable Wealth", desc: "Easy to store and transport" },
        { icon: DollarSign, title: "Hedge Against Inflation", desc: "Protect your purchasing power" },
        { icon: Award, title: "Certified Authenticity", desc: "Guaranteed purity and quality" },
      ]
    : [
        { icon: Sparkles, title: "Exquisite Craftsmanship", desc: "Handcrafted with attention to detail" },
        { icon: Gift, title: "Perfect Gift", desc: "Ideal for special occasions" },
        { icon: Award, title: "Certified Quality", desc: "Authentic precious metals" },
        { icon: Star, title: "Timeless Design", desc: "Classic styles that never go out of fashion" },
      ];

  return (
    <div className="min-h-screen bg-background">
      <SignInPromptDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        action={authDialogAction}
      />
      {/* Breadcrumb */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <FadeIn>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
              <span>/</span>
              <Link href={getCategoryUrl(product.category)} className="hover:text-foreground transition-colors">
                {categoryLabel}
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{product.name}</span>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <AnimatedSection>
            <div className="sticky top-24">
              {productImages.length > 1 ? (
                <ImageCarousel 
                  images={productImages} 
                  aspectRatio="square"
                  showIndicators={true}
                />
              ) : (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-brand-200 bg-brand-50">
                  <Image
                    src={productImages[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    unoptimized={product.images && product.images.length > 0}
                  />
                  {product.purity && (
                    <Badge className="absolute right-4 top-4 bg-white/95 text-brand-700 text-sm px-3 py-1.5 shadow-md">
                      {product.purity} Pure
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Product Information */}
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col h-full">
              {/* Category Badge */}
              <Badge 
                variant="outline" 
                className="mb-4 w-fit border-brand-300 text-brand-700 text-sm px-3 py-1"
              >
                {categoryLabel}
              </Badge>

              {/* Product Name */}
              <h1 className="mb-4 font-serif text-3xl font-bold md:text-4xl lg:text-5xl leading-tight">
                {product.name}
              </h1>

              {/* Variant Selection */}
              {product.hasVariants && variants.length > 0 && (
                <div className="mb-6 space-y-4 p-4 rounded-lg border border-brand-200 bg-brand-50/50">
                  <h3 className="text-sm font-semibold mb-3">Select Options</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Size */}
                    {variants.some(v => v.size) && (
                      <div>
                        <Label htmlFor="variant-size" className="text-xs">Size</Label>
                        <Select
                          value={variantOptions.size}
                          onValueChange={(value) => {
                            setVariantOptions({ ...variantOptions, size: value });
                            const variant = variants.find(v => 
                              v.size === value &&
                              v.finish === (variantOptions.finish || "") &&
                              v.metalType === (variantOptions.metalType || "") &&
                              v.designStyle === (variantOptions.designStyle || "") &&
                              v.stoneType === (variantOptions.stoneType || "")
                            );
                            setSelectedVariant(variant || null);
                          }}
                        >
                          <SelectTrigger id="variant-size" className="h-9 text-sm">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            {Array.from(new Set(variants.map(v => v.size).filter(Boolean))).map((size) => (
                              <SelectItem key={size} value={size!}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Finish */}
                    {variants.some(v => v.finish) && (
                      <div>
                        <Label htmlFor="variant-finish" className="text-xs">Finish</Label>
                        <Select
                          value={variantOptions.finish}
                          onValueChange={(value) => {
                            setVariantOptions({ ...variantOptions, finish: value });
                            const variant = variants.find(v => 
                              v.size === (variantOptions.size || "") &&
                              v.finish === value &&
                              v.metalType === (variantOptions.metalType || "") &&
                              v.designStyle === (variantOptions.designStyle || "") &&
                              v.stoneType === (variantOptions.stoneType || "")
                            );
                            setSelectedVariant(variant || null);
                          }}
                        >
                          <SelectTrigger id="variant-finish" className="h-9 text-sm">
                            <SelectValue placeholder="Select finish" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            {Array.from(new Set(variants.map(v => v.finish).filter(Boolean))).map((finish) => (
                              <SelectItem key={finish} value={finish!}>{finish}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Metal Type */}
                    {variants.some(v => v.metalType) && (
                      <div>
                        <Label htmlFor="variant-metal-type" className="text-xs">Metal Type</Label>
                        <Select
                          value={variantOptions.metalType}
                          onValueChange={(value) => {
                            setVariantOptions({ ...variantOptions, metalType: value });
                            const variant = variants.find(v => 
                              v.size === (variantOptions.size || "") &&
                              v.finish === (variantOptions.finish || "") &&
                              v.metalType === value &&
                              v.designStyle === (variantOptions.designStyle || "") &&
                              v.stoneType === (variantOptions.stoneType || "")
                            );
                            setSelectedVariant(variant || null);
                          }}
                        >
                          <SelectTrigger id="variant-metal-type" className="h-9 text-sm">
                            <SelectValue placeholder="Select metal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            {Array.from(new Set(variants.map(v => v.metalType).filter(Boolean))).map((metal) => (
                              <SelectItem key={metal} value={metal!}>{metal}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Design Style */}
                    {variants.some(v => v.designStyle) && (
                      <div>
                        <Label htmlFor="variant-design-style" className="text-xs">Design Style</Label>
                        <Select
                          value={variantOptions.designStyle}
                          onValueChange={(value) => {
                            setVariantOptions({ ...variantOptions, designStyle: value });
                            const variant = variants.find(v => 
                              v.size === (variantOptions.size || "") &&
                              v.finish === (variantOptions.finish || "") &&
                              v.metalType === (variantOptions.metalType || "") &&
                              v.designStyle === value &&
                              v.stoneType === (variantOptions.stoneType || "")
                            );
                            setSelectedVariant(variant || null);
                          }}
                        >
                          <SelectTrigger id="variant-design-style" className="h-9 text-sm">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            {Array.from(new Set(variants.map(v => v.designStyle).filter(Boolean))).map((style) => (
                              <SelectItem key={style} value={style!}>{style}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Stone Type */}
                    {variants.some(v => v.stoneType) && (
                      <div>
                        <Label htmlFor="variant-stone-type" className="text-xs">Stone Type</Label>
                        <Select
                          value={variantOptions.stoneType}
                          onValueChange={(value) => {
                            setVariantOptions({ ...variantOptions, stoneType: value });
                            const variant = variants.find(v => 
                              v.size === (variantOptions.size || "") &&
                              v.finish === (variantOptions.finish || "") &&
                              v.metalType === (variantOptions.metalType || "") &&
                              v.designStyle === (variantOptions.designStyle || "") &&
                              v.stoneType === value
                            );
                            setSelectedVariant(variant || null);
                          }}
                        >
                          <SelectTrigger id="variant-stone-type" className="h-9 text-sm">
                            <SelectValue placeholder="Select stone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any</SelectItem>
                            {Array.from(new Set(variants.map(v => v.stoneType).filter(Boolean))).map((stone) => (
                              <SelectItem key={stone} value={stone!}>{stone}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {selectedVariant && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      Selected: {[
                        selectedVariant.size,
                        selectedVariant.finish,
                        selectedVariant.metalType,
                        selectedVariant.designStyle,
                        selectedVariant.stoneType,
                      ].filter(Boolean).join(", ") || "Default variant"}
                      {selectedVariant.weight && ` • ${selectedVariant.weight}g`}
                    </div>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                {loadingPrice ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                    <span className="text-lg text-muted-foreground">Calculating price...</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-bold gold-gradient-text">
                      {formatPrice(currentPrice)}
                    </span>
                    {currentPrice && currentPrice !== product.price && (
                      <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                        Live Price
                      </Badge>
                    )}
                  </div>
                )}
                {priceMetadata && (
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {product.pricingModel === "fixed" && (
                      <p>Fixed price</p>
                    )}
                    {(product.pricingModel === "dynamic" || product.pricingModel === "hybrid") && (
                      <>
                        <p>
                          Based on current {priceMetadata.metalType} price: ${priceMetadata.metalPriceUSD.toFixed(2)}/oz
                        </p>
                        {product.pricingModel === "hybrid" && priceMetadata.additionalPrice && priceMetadata.additionalPrice > 0 && (
                          <p className="text-brand-600">
                            + {formatCurrencyPrice(priceMetadata.additionalPrice)} additional
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Price Analytics */}
              {(product.weight && product.purity) && (
                <div className="mb-6">
                  <PriceAnalytics metalType={(product.metalType === "silver" ? "silver" : "gold") as "gold" | "silver"} />
                </div>
              )}

              <Separator className="my-6" />

              {/* Quick Details */}
              {productDetails.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Quick Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {productDetails.slice(0, 4).map((detail, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">{detail.label}</span>
                        <span className="text-sm font-semibold">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Add to Cart */}
              <div className="space-y-3 mb-6">
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2 text-sm text-green-800"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{product.name} added to cart!</span>
                  </motion.div>
                )}
                <AnimatedButton
                  size="lg"
                  className="w-full gold-gradient-button h-12 text-base font-semibold"
                  onClick={handleAddToCart}
                  disabled={addingToCart || (!currentPrice && !product.price) || loadingPrice}
                >
                  <motion.div
                    animate={cartIconControls}
                    className="flex items-center justify-center"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {addingToCart ? "Adding..." : loadingPrice ? "Calculating Price..." : "Add to Cart"}
                  </motion.div>
                </AnimatedButton>
                <div className="flex gap-2">
                  <AnimatedButton 
                    asChild 
                    variant="outline" 
                    className="flex-1 h-12"
                  >
                    <Link href="/live-rate">
                      <Info className="mr-2 h-4 w-4" />
                      View Live Rates
                    </Link>
                  </AnimatedButton>
                  <Button 
                    ref={wishlistButtonRef}
                    variant="outline" 
                    size="icon" 
                    className={`h-12 w-12 relative overflow-visible transition-all duration-300 ${
                      isAnimatingWishlist 
                        ? "bg-amber-500/20 dark:bg-amber-500/30 border-amber-500/50 shadow-lg shadow-amber-500/50" 
                        : isWishlisted 
                        ? "bg-red-50 border-red-200 text-red-600" 
                        : ""
                    }`}
                    onClick={handleWishlistToggle}
                  >
                    <motion.div
                      animate={wishlistIconControls}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Heart className={`h-5 w-5 transition-all duration-300 ${
                        isAnimatingWishlist
                          ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                          : isWishlisted 
                          ? "fill-current" 
                          : ""
                      }`} />
                    </motion.div>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-brand-50/50">
                  <Shield className="h-5 w-5 text-brand-600 mb-2" />
                  <span className="text-xs font-medium">Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-brand-50/50">
                  <Award className="h-5 w-5 text-brand-600 mb-2" />
                  <span className="text-xs font-medium">Certified</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-brand-50/50">
                  <Truck className="h-5 w-5 text-brand-600 mb-2" />
                  <span className="text-xs font-medium">Fast Delivery</span>
                </div>
              </div>

              {/* Tabs for Description/Details/Shipping/Care */}
              <Card className="border-brand-200">
                <CardContent className="p-0">
                  <div className="border-b border-brand-200">
                    <div className="flex overflow-x-auto">
                      <button
                        onClick={() => setSelectedTab("description")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedTab === "description"
                            ? "border-b-2 border-brand-600 text-brand-700"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Description
                      </button>
                      <button
                        onClick={() => setSelectedTab("details")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedTab === "details"
                            ? "border-b-2 border-brand-600 text-brand-700"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setSelectedTab("shipping")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedTab === "shipping"
                            ? "border-b-2 border-brand-600 text-brand-700"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Shipping
                      </button>
                      <button
                        onClick={() => setSelectedTab("care")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedTab === "care"
                            ? "border-b-2 border-brand-600 text-brand-700"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Care
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {selectedTab === "description" && (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
                          {product.description || "No description available."}
                        </p>
                        {isInvestment && (
                          <div className="mt-6 p-4 rounded-lg bg-brand-50 border border-brand-200">
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-brand-600" />
                              Investment Benefits
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              This {product.metalType || "precious metal"} product offers a tangible way to diversify your portfolio. 
                              Precious metals have historically maintained their value and can serve as a hedge against inflation and economic uncertainty.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedTab === "details" && (
                      <div className="space-y-4">
                        {productDetails.length > 0 ? (
                          <dl className="space-y-3">
                            {productDetails.map((detail, index) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b border-brand-100 last:border-0">
                                <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                                <dd className="text-sm font-semibold text-right">{detail.value}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p className="text-sm text-muted-foreground">No additional details available.</p>
                        )}
                      </div>
                    )}
                    {selectedTab === "shipping" && (
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Standard Shipping
                          </h4>
                          <p>Delivery within West Malaysia: 2-5 working days</p>
                          <p>Delivery within East Malaysia: 10-15 working days</p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Free Shipping
                          </h4>
                          <p>Free shipping within Malaysia for orders above RM 500</p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Returns & Exchanges
                          </h4>
                          <p>7 days return policy for defective items or wrong orders</p>
                        </div>
                      </div>
                    )}
                    {selectedTab === "care" && (
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Care Instructions</h4>
                          <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Store in a dry, cool place away from direct sunlight</li>
                            <li>Clean gently with a soft, lint-free cloth</li>
                            <li>Avoid contact with harsh chemicals, perfumes, and lotions</li>
                            <li>Remove jewelry before swimming or exercising</li>
                            <li>For investment products, keep in original packaging when possible</li>
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Frequently Asked Questions
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium text-foreground">Is this product authentic?</p>
                              <p className="text-xs mt-1">Yes, all our products are certified and come with authenticity guarantee.</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Can I return this product?</p>
                              <p className="text-xs mt-1">Yes, we offer 7-day returns for defective items or wrong orders.</p>
                            </div>
                            {isInvestment && (
                              <div>
                                <p className="font-medium text-foreground">How is the price calculated?</p>
                                <p className="text-xs mt-1">Prices are based on current market rates for {product.metalType || "precious metals"} and are updated regularly.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>

        {/* Benefits Section */}
        <AnimatedSection delay={0.4}>
          <div className="mt-12 lg:mt-16">
            <h2 className="text-2xl font-serif font-bold mb-6 text-center">Why Choose This Product?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-6 rounded-lg border border-brand-200 bg-card-level-2 hover:shadow-lg transition-shadow"
                  >
                    <Icon className="h-6 w-6 text-brand-600 mb-3" />
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Customer Reviews */}
        <AnimatedSection delay={0.6}>
          <div className="mt-12 lg:mt-16">
            <ProductReviews />
          </div>
        </AnimatedSection>

        {/* Related Products - Same Category */}
        {relatedProducts.length > 0 && (
          <AnimatedSection delay={0.7}>
            <div className="mt-12 lg:mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold">More from {categoryLabel}</h2>
                <Link href={`/products?category=${product.category}`} className="text-sm text-brand-600 hover:text-brand-700">
                  View All →
                </Link>
              </div>
              {loadingRelated ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.map((relatedProduct, index) => (
                    <motion.div
                      key={relatedProduct.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <ProductCard product={relatedProduct} index={index} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Similar Products - Same Group */}
        {similarProducts.length > 0 && (
          <AnimatedSection delay={0.8}>
            <div className="mt-12 lg:mt-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold">You May Also Like</h2>
                <Link href={`/products?category=${categoryInfo?.group || "all"}`} className="text-sm text-brand-600 hover:text-brand-700">
                  View All →
                </Link>
              </div>
              {loadingSimilar ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarProducts.map((similarProduct, index) => (
                    <motion.div
                      key={similarProduct.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <ProductCard product={similarProduct} index={index} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Why Shop With Us Section */}
        <AnimatedSection delay={0.9}>
          <div className="mt-12 lg:mt-16">
            <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
              <CardContent className="p-8 lg:p-12">
                <h2 className="text-2xl font-serif font-bold mb-6 text-center">Why Shop With KVT Jewellers?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-4">
                      <Award className="h-8 w-8 text-brand-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Authentic Products</h3>
                    <p className="text-sm text-muted-foreground">
                      All our products are certified and come with authenticity guarantee. We source only from trusted suppliers.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-4">
                      <TrendingUp className="h-8 w-8 text-brand-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Competitive Pricing</h3>
                    <p className="text-sm text-muted-foreground">
                      We offer fair, transparent pricing based on current market rates. No hidden fees or charges.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-4">
                      <Shield className="h-8 w-8 text-brand-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Secure & Safe</h3>
                    <p className="text-sm text-muted-foreground">
                      Your purchases are protected with secure packaging and insured shipping. Your satisfaction is our priority.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        {/* Call to Action */}
        <AnimatedSection delay={1.0}>
          <div className="mt-12 lg:mt-16 text-center">
            <Card className="border-brand-200 bg-brand-600 text-white">
              <CardContent className="p-8 lg:p-12">
                <h2 className="text-2xl font-serif font-bold mb-4">Ready to Make Your Purchase?</h2>
                <p className="text-brand-100 mb-6 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who trust KVT Jewellers for their precious metal and jewelry needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <AnimatedButton
                    size="lg"
                    className={`transition-all duration-300 ${
                      isAnimatingCart
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white shadow-lg shadow-amber-500/50"
                        : "bg-white text-brand-600 hover:bg-brand-50"
                    }`}
                    onClick={handleAddToCart}
                    disabled={addingToCart || (!currentPrice && !product.price) || loadingPrice}
                  >
                    <motion.div
                      animate={cartIconControls}
                      className="flex items-center justify-center"
                    >
                      <ShoppingCart className={`mr-2 h-5 w-5 transition-all duration-300 ${
                        isAnimatingCart
                          ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                          : ""
                      }`} />
                      <span className={isAnimatingCart ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" : ""}>
                        Add to Cart
                      </span>
                    </motion.div>
                  </AnimatedButton>
                  <AnimatedButton
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                    asChild
                  >
                    <Link href="/products">
                      Browse More Products
                    </Link>
                  </AnimatedButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
