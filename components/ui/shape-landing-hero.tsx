"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type ElegantShapeProps = {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
};

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: ElegantShapeProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] dark:backdrop-blur-0",
            "shadow-[0_8px_32px_0_rgba(82,21,64,0.1),0_4px_16px_0_rgba(250,195,15,0.05),inset_0_0_0_2px_rgba(82,21,64,0.2),inset_0_0_0_1px_rgba(250,195,15,0.1)]",
            "dark:shadow-[0_8px_32px_0_rgba(82,21,64,0.6),0_4px_16px_0_rgba(250,195,15,0.4),inset_0_0_0_2px_rgba(82,21,64,0.7),inset_0_0_0_1px_rgba(250,195,15,0.5)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(82,21,64,0.15),rgba(250,195,15,0.05),transparent_70%)]",
            "dark:after:bg-[radial-gradient(circle_at_50%_50%,rgba(82,21,64,0.5),rgba(250,195,15,0.3),transparent_60%)]",
            "before:absolute before:inset-0 before:rounded-full",
            "before:bg-gradient-to-r before:from-brand-500/10 before:via-gold-500/5 before:to-transparent",
            "dark:before:from-brand-400/50 dark:before:via-gold-500/45 dark:before:to-transparent",
            "dark:border-2 dark:border-brand-400/40"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

type HeroGeometricProps = {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export function HeroGeometric({
  badge = "shadcn.io",
  title1 = "Elevate Your Digital Vision",
  title2 = "Crafting Exceptional Websites",
  description = "Crafting exceptional digital experiences through innovative design and cutting-edge technology.",
  className,
  children,
}: HeroGeometricProps) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  return (
    <div className={cn("relative min-h-[calc(100vh-120px)] h-auto md:h-[calc(100vh-120px)] w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-white to-background dark:hero-bg-transparent hero-section py-12 md:py-0", className)}>
      {/* Background gradient - Subtle opacity for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.05] via-transparent to-brand-400/[0.05] dark:from-brand-500/[0.03] dark:via-transparent dark:to-brand-400/[0.03] blur-3xl hero-bg-overlay" />

      {/* Decorative shapes - Consistent visibility across themes */}
      <div className="absolute inset-0 overflow-hidden dark:bg-background/30">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-brand-500/[0.15] via-gold-500/[0.1] dark:from-brand-400/[0.75] dark:via-gold-500/[0.7]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%] hidden sm:block"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-gold-500/[0.15] via-brand-400/[0.1] dark:from-gold-500/[0.75] dark:via-brand-400/[0.7]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%] hidden sm:block"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-brand-600/[0.15] via-gold-400/[0.1] dark:from-brand-500/[0.75] dark:via-gold-400/[0.7]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%] hidden sm:block"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-gold-400/[0.15] via-brand-300/[0.1] dark:from-gold-400/[0.75] dark:via-brand-300/[0.7]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%] hidden sm:block"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-brand-200/[0.15] via-gold-300/[0.1] dark:from-brand-400/[0.75] dark:via-gold-300/[0.7]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%] hidden sm:block"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/50 dark:bg-brand-900/30 dark:border-brand-700/50 border border-brand-200/50 dark:border-brand-800/50 mb-4 md:mb-8 lg:mb-12"
          >
            <Circle className="h-2 w-2 fill-gold-500 dark:fill-gold-400" />
            <span className="text-xs sm:text-sm text-brand-700 dark:text-white tracking-wide">
              {badge}
            </span>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold mb-4 md:mb-6 lg:mb-8 tracking-tight px-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 dark:from-brand-300 dark:via-brand-400 dark:to-brand-500">
                Premium{" "}
              </span>
              <span className="gold-gradient-text">Gold</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 dark:from-brand-300 dark:via-brand-400 dark:to-brand-500">
                &{" "}
              </span>
              <span className="silver-gradient-text">Silver</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 dark:from-brand-300 dark:via-brand-400 dark:to-brand-500">
                {" "}Trading
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground dark:text-foreground/80 mb-6 md:mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
              {description}
            </p>
          </motion.div>

          {children && (
            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mt-4 md:mt-8"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>

      {/* Vignette - Consistent across themes */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 pointer-events-none hero-vignette" />
    </div>
  );
}

export type { HeroGeometricProps, ElegantShapeProps };
