"use client";

import { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedTableRow } from "@/components/public/AnimatedTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { AnimatedCounter } from "@/components/public/AnimatedCounter";

interface ProductRate {
  id: string;
  description: string;
  flag: string;
  buy: number;
  sell: number;
}

interface LiveProductRate extends ProductRate {
  buyPrev: number;
  sellPrev: number;
  buyChange: "up" | "down" | "neutral";
  sellChange: "up" | "down" | "neutral";
}

interface ProductRatesTableProps {
  products?: ProductRate[];
}

const defaultProducts: ProductRate[] = [
  { id: "1", description: "GOLD 1 KG / MYR", flag: "🇲🇾", buy: 565043.30, sell: 570843.35 },
  { id: "2", description: "100 GM CASTING GOLD BAR", flag: "🇲🇾", buy: 56704.30, sell: 57405.35 },
  { id: "3", description: "916 RETAIL / TRADE IN PRICE", flag: "🇲🇾", buy: 493.00, sell: 560.00 },
  { id: "4", description: "916 CASH PURCHASE RATE", flag: "🇲🇾", buy: 493, sell: 560 },
  { id: "5", description: "835 GOLD", flag: "🪙", buy: 394.00, sell: 500.00 },
  { id: "6", description: "750 Gold", flag: "🇲🇾", buy: 341.00, sell: 455.00 },
  { id: "7", description: "SILVER 1KG / MYR", flag: "🇲🇾", buy: 9304.85, sell: 10934.95 },
];

export function ProductRatesTable({ products = defaultProducts }: ProductRatesTableProps) {
  const [liveProducts, setLiveProducts] = useState<LiveProductRate[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize prices
  useEffect(() => {
    const initialProducts: LiveProductRate[] = products.map((product) => ({
      ...product,
      buyPrev: product.buy,
      sellPrev: product.sell,
      buyChange: "neutral",
      sellChange: "neutral",
    }));

    setLiveProducts(initialProducts);
  }, [products]);

  // Update prices every 2 seconds
  useEffect(() => {
    if (liveProducts.length === 0) return;

    intervalRef.current = setInterval(() => {
      setLiveProducts((prev) =>
        prev.map((product) => {
          // Calculate small fixed change for MYR (all products are in MYR)
          // For larger amounts (like 1KG gold), use larger changes
          // For smaller amounts (like 916 rates), use smaller changes
          const baseAmount = product.buy > 10000 ? 1.00 + Math.random() * 4.00 : 0.10 + Math.random() * 0.90; // RM 0.10 to RM 1.00 for small, RM 1.00 to RM 5.00 for large
          
          const buyDirection = Math.random() > 0.5 ? 1 : -1;
          const sellDirection = Math.random() > 0.5 ? 1 : -1;
          
          const buyChange = buyDirection === 1 ? "up" : "down";
          const sellChange = sellDirection === 1 ? "up" : "down";
          
          const newBuy = product.buy + (buyDirection * baseAmount);
          const newSell = product.sell + (sellDirection * baseAmount);

          return {
            ...product,
            buyPrev: product.buy,
            sellPrev: product.sell,
            buy: newBuy,
            sell: newSell,
            buyChange,
            sellChange,
          };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [liveProducts.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getChangeColor = (change: "up" | "down" | "neutral") => {
    if (change === "up") return "text-green-600";
    if (change === "down") return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-brand-500 text-white">
              <TableHead className="text-white">Description</TableHead>
              <TableHead className="text-right text-white">Buy</TableHead>
              <TableHead className="text-right text-white">Sell</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liveProducts.map((product, index) => (
              <AnimatedTableRow key={product.id} index={index}>
                <TableCell className="font-medium">
                  <span className="mr-2">{product.flag}</span>
                  {product.description}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  <div className="flex items-center justify-end gap-1.5">
                    {product.buyChange !== "neutral" && (
                      <ArrowUp
                        className={`h-3.5 w-3.5 ${getChangeColor(product.buyChange)}`}
                        style={{
                          transform: product.buyChange === "down" ? "rotate(180deg)" : "none",
                        }}
                      />
                    )}
                    <span className={getChangeColor(product.buyChange)}>
                      <AnimatedCounter
                        value={product.buy}
                        decimals={2}
                        prefix="RM "
                      />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  <div className="flex items-center justify-end gap-1.5">
                    {product.sellChange !== "neutral" && (
                      <ArrowUp
                        className={`h-3.5 w-3.5 ${getChangeColor(product.sellChange)}`}
                        style={{
                          transform: product.sellChange === "down" ? "rotate(180deg)" : "none",
                        }}
                      />
                    )}
                    <span className={getChangeColor(product.sellChange)}>
                      <AnimatedCounter
                        value={product.sell}
                        decimals={2}
                        prefix="RM "
                      />
                    </span>
                  </div>
                </TableCell>
              </AnimatedTableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {liveProducts.map((product, index) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="bg-brand-500 text-white pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span>{product.flag}</span>
                <span className="line-clamp-2">{product.description}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Buy</span>
                <div className="flex items-center gap-1.5">
                  {product.buyChange !== "neutral" && (
                    <ArrowUp
                      className={`h-3.5 w-3.5 ${getChangeColor(product.buyChange)}`}
                      style={{
                        transform: product.buyChange === "down" ? "rotate(180deg)" : "none",
                      }}
                    />
                  )}
                  <span className={`text-sm font-semibold ${getChangeColor(product.buyChange)}`}>
                    <AnimatedCounter
                      value={product.buy}
                      decimals={2}
                      prefix="RM "
                    />
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sell</span>
                <div className="flex items-center gap-1.5">
                  {product.sellChange !== "neutral" && (
                    <ArrowUp
                      className={`h-3.5 w-3.5 ${getChangeColor(product.sellChange)}`}
                      style={{
                        transform: product.sellChange === "down" ? "rotate(180deg)" : "none",
                      }}
                    />
                  )}
                  <span className={`text-sm font-semibold ${getChangeColor(product.sellChange)}`}>
                    <AnimatedCounter
                      value={product.sell}
                      decimals={2}
                      prefix="RM "
                    />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
