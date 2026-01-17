"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/animated-section";

interface StaffDashboardHeaderProps {
  userName: string;
}

export function StaffDashboardHeader({ userName }: StaffDashboardHeaderProps) {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AnimatedSection>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl font-bold text-brand-700"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-lg text-muted-foreground"
            >
              {greeting}, <span className="font-semibold text-brand-600">{userName}</span>
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-50 to-amber-50 border border-brand-200/50"
          >
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-brand-700">System Active</span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatedSection>
  );
}
