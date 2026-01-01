"use client";

import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoldPrice } from "@/types/gold-prices";

interface GoldPriceDisplayProps {
  prices: GoldPrice[];
  showLastUpdated?: boolean;
}

const priceTypeLabels: Record<string, string> = {
  GOLD_C: "GOLD - C",
  GOLD_USD: "GOLD ($)",
  SILVER_C: "SILVER - C",
  SILVER_USD: "SILVER ($)",
  SING: "SING",
};

export function GoldPriceDisplay({ prices, showLastUpdated = true }: GoldPriceDisplayProps) {
  const displayPrice = (price: GoldPrice) => {
    return price.overridePrice ?? price.fetchedPrice;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: currency === "MYR" ? "MYR" : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    // Use consistent formatting to avoid hydration mismatches
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

  const lastUpdated = prices.length > 0 ? prices[0].lastUpdated : new Date();

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
            {prices.map((price, index) => (
              <motion.tr
                key={price.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ backgroundColor: "rgba(82, 21, 64, 0.05)" }}
                className="transition-colors"
              >
                <TableCell className="font-medium">
                  {priceTypeLabels[price.type] || price.type}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  <motion.span
                    className="gold-gradient-text"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {formatPrice(displayPrice(price), price.currency)}
                  </motion.span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {prices.map((price, index) => (
          <Card key={price.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {priceTypeLabels[price.type] || price.type}
                </span>
                <motion.span
                  className="text-lg font-semibold gold-gradient-text"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {formatPrice(displayPrice(price), price.currency)}
                </motion.span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showLastUpdated && (
        <p className="mt-4 text-xs text-muted-foreground text-center md:text-left">
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}
    </div>
  );
}
