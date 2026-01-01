"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/animated-section";

interface StaffDashboardHeaderProps {
  userName: string;
}

export function StaffDashboardHeader({ userName }: StaffDashboardHeaderProps) {
  return (
    <AnimatedSection>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-4xl font-bold text-brand-700"
        >
          Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-lg text-muted-foreground"
        >
          Welcome back, <span className="font-semibold text-brand-600">{userName}</span>
        </motion.p>
      </motion.div>
    </AnimatedSection>
  );
}
