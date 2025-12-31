"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui/button";

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode;
  hoverScale?: number;
}

export function AnimatedButton({ 
  children, 
  hoverScale = 1.05,
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}

