"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { GoldPrice } from "@/types/gold-prices";

interface HomePriceTickerProps {
  prices: GoldPrice[];
  showLastUpdated?: boolean;
}

interface LivePriceData {
  id: string;
  type: string;
  label: string;
  price: number;
  currency: string;
  change: "up" | "down" | "neutral";
  prevPrice: number;
}

const priceTypeLabels: Record<string, string> = {
  GOLD_C: "GOLD - C",
  GOLD_USD: "GOLD ($)",
  SILVER_C: "SILVER - C",
  SILVER_USD: "SILVER ($)",
  SING: "SING",
};

export function HomePriceTicker({ prices, showLastUpdated = true }: HomePriceTickerProps) {
  const [livePrices, setLivePrices] = useState<LivePriceData[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize prices
  useEffect(() => {
    const initialPrices: LivePriceData[] = prices.map((price) => {
      const displayPrice = price.overridePrice ?? price.fetchedPrice;
      return {
        id: price.id,
        type: price.type,
        label: priceTypeLabels[price.type] || price.type,
        price: displayPrice,
        currency: price.currency,
        change: "neutral",
        prevPrice: displayPrice,
      };
    });

    setLivePrices(initialPrices);
  }, [prices]);

  // Update prices every 2 seconds
  useEffect(() => {
    if (livePrices.length === 0) return;

    intervalRef.current = setInterval(() => {
      setLivePrices((prev) =>
        prev.map((price) => {
          // Calculate small fixed change based on currency
          let changeAmount: number;
          if (price.currency === "USD") {
            changeAmount = 0.10 + Math.random() * 0.90; // $0.10 to $1.00
          } else if (price.currency === "MYR") {
            changeAmount = 0.10 + Math.random() * 0.90; // RM 0.10 to RM 1.00
          } else if (price.currency === "INR") {
            changeAmount = 1 + Math.random() * 9; // ₹1 to ₹10
          } else {
            changeAmount = 0.10 + Math.random() * 0.90; // Default: 0.10 to 1.00
          }
          
          const direction = Math.random() > 0.5 ? 1 : -1; // Up or down
          const change = direction === 1 ? "up" : "down";
          const newPrice = price.price + (direction * changeAmount);

          return {
            ...price,
            prevPrice: price.price,
            price: newPrice,
            change,
          };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [livePrices.length]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: currency === "MYR" ? "MYR" : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const hours12 = date.getHours() % 12 || 12;
    
    return `${month}/${day}/${year}, ${hours12}:${minutes}:${seconds} ${ampm}`;
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

  const RollingNumber = ({ value, prevValue, currency, change }: {
    value: number;
    prevValue: number;
    currency: string;
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
        className={`inline-flex items-center gap-1.5 font-semibold ${getChangeColor(change)}`}
        animate={{
          scale: change !== "neutral" ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {formatPrice(displayValue, currency)}
      </motion.span>
    );
  };

  const lastUpdated = prices.length > 0 ? prices[0].lastUpdated : new Date();

  if (livePrices.length === 0) return null;

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {livePrices.map((price, index) => (
              <motion.tr
                key={price.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`transition-colors ${getChangeBgColor(price.change)}`}
              >
                <TableCell className="font-medium">
                  {price.label}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <AnimatePresence mode="wait">
                      {price.change !== "neutral" && (
                        <motion.div
                          key={price.change}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={getChangeColor(price.change)}
                        >
                          {price.change === "up" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <RollingNumber
                      value={price.price}
                      prevValue={price.prevPrice}
                      currency={price.currency}
                      change={price.change}
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
        {livePrices.map((price, index) => (
          <motion.div
            key={price.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`overflow-hidden transition-colors ${getChangeBgColor(price.change)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {price.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <AnimatePresence mode="wait">
                      {price.change !== "neutral" && (
                        <motion.div
                          key={price.change}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={getChangeColor(price.change)}
                        >
                          {price.change === "up" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <RollingNumber
                      value={price.price}
                      prevValue={price.prevPrice}
                      currency={price.currency}
                      change={price.change}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {showLastUpdated && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600"></div>
            <span className="text-xs font-medium text-green-700">Live</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: {formatDate(lastUpdated)} • Updates every 2s
          </p>
        </div>
      )}
    </div>
  );
}

