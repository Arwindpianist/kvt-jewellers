"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { GoldPrice } from "@/types/gold-prices";

interface LivePriceTickerProps {
  prices: GoldPrice[];
}

interface LivePriceData {
  id: string;
  type: string;
  label: string;
  flag: string;
  bid: number;
  ask: number;
  high: number;
  low: number;
  currency: string;
  bidChange: "up" | "down" | "neutral";
  askChange: "up" | "down" | "neutral";
  bidPrev: number;
  askPrev: number;
}

const priceTypeLabels: Record<string, { label: string; flag: string }> = {
  GOLD_USD: { label: "GOLD($)", flag: "🇺🇸" },
  SILVER_USD: { label: "SILVER($)", flag: "🇺🇸" },
  MYR_USD: { label: "MYR / USD", flag: "🇲🇾" },
  MYR_INR: { label: "MYR / INR", flag: "🇲🇾🇮🇳" },
};

export function LivePriceTicker({ prices }: LivePriceTickerProps) {
  const [livePrices, setLivePrices] = useState<LivePriceData[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize prices
  useEffect(() => {
    const liveRatePrices = prices.filter(
      (p) => p.type === "GOLD_USD" || p.type === "SILVER_USD" || p.type === "MYR_USD" || p.type === "MYR_INR"
    );

    const initialPrices: LivePriceData[] = liveRatePrices.map((price) => {
      const info = priceTypeLabels[price.type];
      const displayPrice = price.overridePrice ?? price.fetchedPrice;
      const bid = price.bid ?? displayPrice;
      const ask = price.ask ?? displayPrice * 1.001;
      const high = price.high ?? displayPrice * 1.01;
      const low = price.low ?? displayPrice * 0.99;

      return {
        id: price.id,
        type: price.type,
        label: info?.label || price.type,
        flag: info?.flag || "",
        bid,
        ask,
        high,
        low,
        currency: price.currency,
        bidChange: "neutral",
        askChange: "neutral",
        bidPrev: bid,
        askPrev: ask,
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
          const bidChange = direction === 1 ? "up" : "down";
          const askChange = direction === 1 ? "up" : "down";

          const newBid = price.bid + (direction * changeAmount);
          const newAsk = price.ask + (direction * changeAmount);

          // Update high/low if needed
          const newHigh = Math.max(price.high, newBid, newAsk);
          const newLow = Math.min(price.low, newBid, newAsk);

          return {
            ...price,
            bidPrev: price.bid,
            askPrev: price.ask,
            bid: newBid,
            ask: newAsk,
            high: newHigh,
            low: newLow,
            bidChange,
            askChange,
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

  const formatPrice = (price: number, currency: string, decimals: number = 2, isExchangeRate: boolean = false) => {
    // For exchange rates (MYR/USD, MYR/INR), show without currency symbol but with commas
    if (isExchangeRate) {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(price);
    }
    // For regular USD prices (GOLD, SILVER)
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(price);
    }
    // For other currencies, format with commas
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
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
        return <Minus className="h-3 w-3" />;
    }
  };

  const RollingNumber = ({ value, prevValue, currency, decimals, change, isExchangeRate }: {
    value: number;
    prevValue: number;
    currency: string;
    decimals: number;
    change: "up" | "down" | "neutral";
    isExchangeRate?: boolean;
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
        {formatPrice(displayValue, currency, decimals, isExchangeRate)}
      </motion.span>
    );
  };

  if (livePrices.length === 0) return null;

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-brand-500 text-white">
              <TableHead className="text-white">DESCRIPTION</TableHead>
              <TableHead className="text-right text-white">BID</TableHead>
              <TableHead className="text-right text-white">ASK</TableHead>
              <TableHead className="text-right text-white">HIGH</TableHead>
              <TableHead className="text-right text-white">LOW</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {livePrices.map((price, index) => {
              const decimals = price.type === "MYR_USD" || price.type === "MYR_INR" ? 4 : 2;
              const isExchangeRate = price.type === "MYR_USD" || price.type === "MYR_INR";

              return (
                <motion.tr
                  key={price.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`transition-colors ${getChangeBgColor(price.bidChange)}`}
                >
                  <TableCell className="font-medium">
                    <span className="mr-2">{price.flag}</span>
                    {price.label}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <AnimatePresence mode="wait">
                        {price.bidChange !== "neutral" && (
                          <motion.div
                            key={price.bidChange}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className={getChangeColor(price.bidChange)}
                          >
                            {getChangeIcon(price.bidChange)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <RollingNumber
                        value={price.bid}
                        prevValue={price.bidPrev}
                        currency={price.currency}
                        decimals={decimals}
                        change={price.bidChange}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <AnimatePresence mode="wait">
                        {price.askChange !== "neutral" && (
                          <motion.div
                            key={price.askChange}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className={getChangeColor(price.askChange)}
                          >
                            {getChangeIcon(price.askChange)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <RollingNumber
                        value={price.ask}
                        prevValue={price.askPrev}
                        currency={price.currency}
                        decimals={decimals}
                        change={price.askChange}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {formatPrice(price.high, price.currency, decimals, isExchangeRate)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {formatPrice(price.low, price.currency, decimals, isExchangeRate)}
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {livePrices.map((price, index) => {
          const decimals = price.type === "MYR_USD" || price.type === "MYR_INR" ? 4 : 2;
          const isExchangeRate = price.type === "MYR_USD" || price.type === "MYR_INR";

          return (
            <motion.div
              key={price.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden transition-colors ${getChangeBgColor(price.bidChange)}`}>
                <CardHeader className="bg-brand-500 text-white pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{price.flag}</span>
                    {price.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">BID</span>
                    <div className="flex items-center gap-1.5">
                      <AnimatePresence mode="wait">
                        {price.bidChange !== "neutral" && (
                          <motion.div
                            key={price.bidChange}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className={getChangeColor(price.bidChange)}
                          >
                            {getChangeIcon(price.bidChange)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <RollingNumber
                        value={price.bid}
                        prevValue={price.bidPrev}
                        currency={price.currency}
                        decimals={decimals}
                        change={price.bidChange}
                        isExchangeRate={isExchangeRate}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">ASK</span>
                    <div className="flex items-center gap-1.5">
                      <AnimatePresence mode="wait">
                        {price.askChange !== "neutral" && (
                          <motion.div
                            key={price.askChange}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className={getChangeColor(price.askChange)}
                          >
                            {getChangeIcon(price.askChange)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <RollingNumber
                        value={price.ask}
                        prevValue={price.askPrev}
                        currency={price.currency}
                        decimals={decimals}
                        change={price.askChange}
                        isExchangeRate={isExchangeRate}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">HIGH</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatPrice(price.high, price.currency, decimals, isExchangeRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">LOW</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatPrice(price.low, price.currency, decimals, isExchangeRate)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

