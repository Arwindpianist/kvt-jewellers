"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

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
          const baseAmount = product.buy > 10000 ? 1.00 + Math.random() * 4.00 : 0.10 + Math.random() * 0.90;
          
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
    switch (change) {
      case "up":
        return "text-green-600 dark:text-green-500";
      case "down":
        return "text-red-600 dark:text-red-500";
      default:
        return "text-foreground";
    }
  };

  const getChangeBgColor = (change: "up" | "down" | "neutral") => {
    switch (change) {
      case "up":
        return "bg-green-50 dark:bg-green-950/20";
      case "down":
        return "bg-red-50 dark:bg-red-950/20";
      default:
        return "";
    }
  };

  const getChangeIcon = (change: "up" | "down" | "neutral") => {
    switch (change) {
      case "up":
        return <ArrowUp className="h-3 w-3" />;
      case "down":
        return <ArrowDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const RollingNumber = ({ value, prevValue, change }: {
    value: number;
    prevValue: number;
    change: "up" | "down" | "neutral";
  }) => {
    const [displayValue, setDisplayValue] = useState(prevValue);

    useEffect(() => {
      const duration = 500; // Animation duration in ms
      const startTime = Date.now();
      const startValue = prevValue;
      const endValue = value;
      const difference = endValue - startValue;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + difference * easeOutCubic;

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
        }
      };

      requestAnimationFrame(animate);
    }, [value, prevValue]);

    return (
      <motion.span
        className={`inline-flex items-center gap-1 font-mono ${getChangeColor(change)}`}
        animate={{
          scale: change !== "neutral" ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        RM {formatPrice(displayValue)}
      </motion.span>
    );
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-brand-500 text-white">
              <TableHead className="text-white">DESCRIPTION</TableHead>
              <TableHead className="text-right text-white">BUY</TableHead>
              <TableHead className="text-right text-white">SELL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liveProducts.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`transition-colors ${getChangeBgColor(product.buyChange)}`}
              >
                <TableCell className="font-medium">
                  <span className="mr-2">{product.flag}</span>
                  {product.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <AnimatePresence mode="wait">
                      {product.buyChange !== "neutral" && (
                        <motion.div
                          key={product.buyChange}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={getChangeColor(product.buyChange)}
                        >
                          {getChangeIcon(product.buyChange)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <RollingNumber
                      value={product.buy}
                      prevValue={product.buyPrev}
                      change={product.buyChange}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <AnimatePresence mode="wait">
                      {product.sellChange !== "neutral" && (
                        <motion.div
                          key={product.sellChange}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={getChangeColor(product.sellChange)}
                        >
                          {getChangeIcon(product.sellChange)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <RollingNumber
                      value={product.sell}
                      prevValue={product.sellPrev}
                      change={product.sellChange}
                    />
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {liveProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`overflow-hidden transition-colors ${getChangeBgColor(product.buyChange)}`}>
              <CardHeader className="bg-brand-500 text-white pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{product.flag}</span>
                  <span className="line-clamp-2">{product.description}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">BUY</span>
                  <div className="flex items-center gap-1.5">
                    <AnimatePresence mode="wait">
                      {product.buyChange !== "neutral" && (
                        <motion.div
                          key={product.buyChange}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={getChangeColor(product.buyChange)}
                        >
                          {getChangeIcon(product.buyChange)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <RollingNumber
                      value={product.buy}
                      prevValue={product.buyPrev}
                      change={product.buyChange}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">SELL</span>
                  <div className="flex items-center gap-1.5">
                    <AnimatePresence mode="wait">
                      {product.sellChange !== "neutral" && (
                        <motion.div
                          key={product.sellChange}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={getChangeColor(product.sellChange)}
                        >
                          {getChangeIcon(product.sellChange)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <RollingNumber
                      value={product.sell}
                      prevValue={product.sellPrev}
                      change={product.sellChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}
