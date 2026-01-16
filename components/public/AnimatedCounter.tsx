"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  locale?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  className,
  prefix = "",
  suffix = "",
  decimals = 2,
  locale = "en-US",
}: AnimatedCounterProps) {
  const spring = useSpring(0, { duration });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      // Format with proper commas and decimals
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(latest);
      setDisplayValue(formatted);
    });
    return () => unsubscribe();
  }, [spring, decimals, locale]);

  return (
    <motion.span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
}

