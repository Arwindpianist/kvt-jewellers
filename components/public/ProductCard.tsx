"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard } from "@/components/ui/hover-card";
import { categoryImages } from "@/lib/image-placeholders";
import type { Product } from "@/types/products";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <HoverCard>
        <Card className="group overflow-hidden bg-card-level-2 shadow-card-elevated transition-all hover:bg-card-level-3 hover:shadow-card-floating">
          <Link href={`/product/${product.id}`}>
            <div className="relative aspect-square w-full overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="relative h-full w-full"
              >
                <Image
                  src={categoryImages[product.category] || categoryImages.jewellery}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/20 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {product.purity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Badge className="absolute right-3 top-3 bg-white/90 text-brand-700">
                    {product.purity}
                  </Badge>
                </motion.div>
              )}
            </div>
            <CardContent className="p-4 sm:p-6">
              <motion.h3
                className="mb-2 font-serif text-lg sm:text-xl font-semibold line-clamp-2 group-hover:text-brand-500 transition-colors"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {product.name}
              </motion.h3>
              <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <motion.span
                  className="font-semibold text-base sm:text-lg gold-gradient-text"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {formatPrice(product.price)}
                </motion.span>
                {product.weight && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                  >
                    <Badge variant="outline" className="text-xs">
                      {product.weight}g
                    </Badge>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Link>
        </Card>
      </HoverCard>
    </motion.div>
  );
}
