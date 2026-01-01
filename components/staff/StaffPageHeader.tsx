"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/animated-section";
import { TrendingUp, Package, BarChart3, Settings, FileText } from "lucide-react";

const iconMap = {
  TrendingUp,
  Package,
  BarChart3,
  Settings,
  FileText,
};

type IconName = keyof typeof iconMap;

interface StaffPageHeaderProps {
  icon: IconName;
  title: string;
  description: string;
}

export function StaffPageHeader({ icon, title, description }: StaffPageHeaderProps) {
  const Icon = iconMap[icon] || TrendingUp;

  return (
    <AnimatedSection>
      <div className="mb-8 flex items-center gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600"
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl font-bold text-brand-700"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-1 text-muted-foreground"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </AnimatedSection>
  );
}
