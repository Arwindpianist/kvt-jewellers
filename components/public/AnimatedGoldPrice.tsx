"use client";

import { motion } from "framer-motion";
import { GoldPriceDisplay } from "./GoldPriceDisplay";
import type { GoldPrice } from "@/types/gold-prices";

interface AnimatedGoldPriceProps {
  prices: GoldPrice[];
  showLastUpdated?: boolean;
}

export function AnimatedGoldPrice({ prices, showLastUpdated = true }: AnimatedGoldPriceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GoldPriceDisplay prices={prices} showLastUpdated={showLastUpdated} />
    </motion.div>
  );
}

