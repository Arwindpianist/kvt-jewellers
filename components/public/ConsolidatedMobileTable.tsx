"use client";

import { useEffect, useState, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { fetchExchangeRates } from "@/lib/currency-converter";
import type { GoldPrice } from "@/types/gold-prices";

interface ConsolidatedMobileTableProps {
  prices: GoldPrice[];
}

interface LivePriceData {
  id: string;
  type: string;
  label: string;
  flag: string;
  bid: number;
  ask: number;
  currency: string;
  bidChange: "up" | "down" | "neutral";
  askChange: "up" | "down" | "neutral";
  bidPrev: number;
  askPrev: number;
}

const priceTypeLabels: Record<string, { label: string; flag: string }> = {
  GOLD_USD: { label: "GOLD", flag: "🇺🇸" },
  SILVER_USD: { label: "SILVER", flag: "🇺🇸" },
  MYR_USD: { label: "MYR/USD", flag: "🇲🇾" },
  MYR_INR: { label: "MYR/INR", flag: "🇲🇾🇮🇳" },
};

export function ConsolidatedMobileTable({ prices }: ConsolidatedMobileTableProps) {
  const { currency: selectedCurrency } = useCurrency();
  const [livePrices, setLivePrices] = useState<LivePriceData[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{ MYR: number; INR: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch exchange rates for currency conversion
  useEffect(() => {
    fetchExchangeRates().then(setExchangeRates).catch(console.error);
  }, []);

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

      return {
        id: price.id,
        type: price.type,
        label: info?.label || price.type,
        flag: info?.flag || "",
        bid,
        ask,
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
          const changeAmount = price.currency === "USD" ? 0.10 + Math.random() * 0.90 : 0.10 + Math.random() * 0.90;
          const direction = Math.random() > 0.5 ? 1 : -1;
          const bidChange = direction === 1 ? "up" : "down";
          const askChange = direction === 1 ? "up" : "down";

          return {
            ...price,
            bidPrev: price.bid,
            askPrev: price.ask,
            bid: price.bid + (direction * changeAmount),
            ask: price.ask + (direction * changeAmount),
            bidChange,
            askChange,
          };
        })
      );

    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [livePrices.length]);

  const formatPrice = (price: number, currency: string, decimals: number = 2, isExchangeRate: boolean = false) => {
    if (isExchangeRate) {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(price);
    }
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(price);
    }
    if (currency === "MYR") {
      return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(price);
    }
    if (currency === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(price);
    }
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  };

  const convertPrice = (priceUSD: number, targetCurrency: string): number => {
    if (!exchangeRates) return priceUSD;
    if (targetCurrency === "USD") return priceUSD;
    if (targetCurrency === "MYR") return priceUSD * exchangeRates.MYR;
    if (targetCurrency === "INR") return priceUSD * exchangeRates.INR;
    return priceUSD;
  };

  const getChangeIcon = (change: "up" | "down" | "neutral") => {
    if (change === "up") return <ArrowUp className="h-2.5 w-2.5" />;
    if (change === "down") return <ArrowDown className="h-2.5 w-2.5" />;
    return null;
  };

  const getChangeColor = (change: "up" | "down" | "neutral") => {
    if (change === "up") return "text-green-600";
    if (change === "down") return "text-red-600";
    return "text-foreground";
  };

  if (livePrices.length === 0) return null;

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-brand-500 text-white h-9">
            <TableHead className="text-white text-xs font-semibold px-2 py-2 w-1/3">Item</TableHead>
            <TableHead className="text-white text-xs font-semibold px-2 py-2 text-right w-1/3">Bid</TableHead>
            <TableHead className="text-white text-xs font-semibold px-2 py-2 text-right w-1/3">Ask</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {livePrices.map((price) => {
            const decimals = price.type === "MYR_USD" || price.type === "MYR_INR" ? 4 : 2;
            const isExchangeRate = price.type === "MYR_USD" || price.type === "MYR_INR";
            
            // Convert prices based on selected currency
            let displayBid = price.bid;
            let displayAsk = price.ask;
            let displayBidPrev = price.bidPrev;
            let displayAskPrev = price.askPrev;
            let displayCurrency = price.currency;

            if (!isExchangeRate && exchangeRates) {
              // For GOLD and SILVER, convert from USD to selected currency
              displayBid = convertPrice(price.bid, selectedCurrency);
              displayAsk = convertPrice(price.ask, selectedCurrency);
              displayBidPrev = convertPrice(price.bidPrev, selectedCurrency);
              displayAskPrev = convertPrice(price.askPrev, selectedCurrency);
              displayCurrency = selectedCurrency;
            }

            // Smooth animation value
            const displayBidValue = displayBidPrev + (displayBid - displayBidPrev) * 0.5;
            const displayAskValue = displayAskPrev + (displayAsk - displayAskPrev) * 0.5;

            return (
              <TableRow key={price.id} className="h-8 border-b">
                <TableCell className="px-2 py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm leading-none">{price.flag}</span>
                    <span className="text-xs font-medium truncate">{price.label}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-2 py-2">
                  <div className="flex items-center justify-end gap-1">
                    {price.bidChange !== "neutral" && (
                      <span className={getChangeColor(price.bidChange)}>{getChangeIcon(price.bidChange)}</span>
                    )}
                    <span className={`text-xs font-mono ${getChangeColor(price.bidChange)}`}>
                      {isExchangeRate ? formatPrice(displayBidValue, displayCurrency, 4, true) : formatPrice(displayBidValue, displayCurrency, 2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-2 py-2">
                  <div className="flex items-center justify-end gap-1">
                    {price.askChange !== "neutral" && (
                      <span className={getChangeColor(price.askChange)}>{getChangeIcon(price.askChange)}</span>
                    )}
                    <span className={`text-xs font-mono ${getChangeColor(price.askChange)}`}>
                      {isExchangeRate ? formatPrice(displayAskValue, displayCurrency, 4, true) : formatPrice(displayAskValue, displayCurrency, 2)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
