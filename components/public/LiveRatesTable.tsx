"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedTableRow } from "@/components/public/AnimatedTable";
import type { GoldPrice } from "@/types/gold-prices";

interface LiveRatesTableProps {
  prices: GoldPrice[];
}

const priceTypeLabels: Record<string, { label: string; flag: string }> = {
  GOLD_USD: { label: "GOLD($)", flag: "🇺🇸" },
  SILVER_USD: { label: "SILVER($)", flag: "🇺🇸" },
  MYR_USD: { label: "MYR / USD", flag: "🇲🇾" },
  MYR_INR: { label: "MYR / INR", flag: "🇲🇾🇮🇳" },
};

export function LiveRatesTable({ prices }: LiveRatesTableProps) {
  const formatPrice = (price: number | undefined, decimals: number = 2) => {
    if (price === undefined) return "-";
    return price.toFixed(decimals);
  };

  const getPriceColor = (price: number | undefined) => {
    if (price === undefined) return "";
    // Green for positive, red for negative (simplified)
    return "text-green-600";
  };

  const liveRatePrices = prices.filter((p) => 
    p.type === "GOLD_USD" || p.type === "SILVER_USD" || p.type === "MYR_USD" || p.type === "MYR_INR"
  );

  return (
    <div className="w-full overflow-x-auto">
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
          {liveRatePrices.map((price, index) => {
            const info = priceTypeLabels[price.type];
            const displayPrice = price.overridePrice ?? price.fetchedPrice;
            const bid = price.bid ?? displayPrice;
            const ask = price.ask ?? displayPrice * 1.001;
            const high = price.high ?? displayPrice * 1.01;
            const low = price.low ?? displayPrice * 0.99;

            return (
              <AnimatedTableRow key={price.id} index={index}>
                <TableCell className="font-medium">
                  <span className="mr-2">{info?.flag || ""}</span>
                  {info?.label || price.type}
                </TableCell>
                <TableCell className={`text-right font-semibold ${getPriceColor(bid)}`}>
                  {formatPrice(bid, price.type === "MYR_USD" || price.type === "MYR_INR" ? 4 : 2)}
                </TableCell>
                <TableCell className={`text-right font-semibold ${getPriceColor(ask)}`}>
                  {formatPrice(ask, price.type === "MYR_USD" || price.type === "MYR_INR" ? 4 : 2)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(high, price.type === "MYR_USD" || price.type === "MYR_INR" ? 4 : 2)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(low, price.type === "MYR_USD" || price.type === "MYR_INR" ? 4 : 2)}
                </TableCell>
              </AnimatedTableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

