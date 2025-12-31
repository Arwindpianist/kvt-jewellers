"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PulseAnimationProps {
  children: ReactNode;
  className?: string;
}

export function PulseAnimation({ children, className }: PulseAnimationProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

