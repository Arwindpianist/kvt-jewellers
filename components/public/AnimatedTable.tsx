"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedTableRowProps {
  children: ReactNode;
  index: number;
}

export function AnimatedTableRow({ children, index }: AnimatedTableRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ backgroundColor: "rgba(82, 21, 64, 0.05)" }}
      className="transition-colors"
    >
      {children}
    </motion.tr>
  );
}

