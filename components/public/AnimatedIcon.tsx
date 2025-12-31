"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedIcon({ children, className }: AnimatedIconProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ rotate: 360, scale: 1.1 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

