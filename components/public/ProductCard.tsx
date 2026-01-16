"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryImages } from "@/lib/image-placeholders";
import type { Product } from "@/types/products";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price?: number) => {
    if (!price) return "Price on request";
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden bg-card-level-2 shadow-card transition-shadow duration-200 hover:shadow-card-elevated">
      <Link href={`/product/${product.id}`} className="block h-full flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={categoryImages[product.category] || categoryImages.jewellery}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {product.purity && (
            <Badge className="absolute right-2 top-2 bg-white/95 text-brand-700 text-xs font-medium">
              {product.purity}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="mb-2 font-serif text-base font-semibold line-clamp-2 group-hover:text-brand-600 transition-colors duration-200 min-h-[2.5rem]">
            {product.name}
          </h3>
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed flex-1 min-h-[2.5rem]">
            {product.description}
          </p>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="font-semibold text-base gold-gradient-text">
              {formatPrice(product.price)}
            </span>
            {product.weight && (
              <Badge variant="outline" className="text-xs shrink-0 font-medium">
                {product.weight}g
              </Badge>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
