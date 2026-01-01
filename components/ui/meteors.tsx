"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export const Meteors = ({ number = 20, className }: MeteorsProps) => {
  const [meteors, setMeteors] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    const meteorStyles = Array.from({ length: number }).map(() => {
      // Random position (0-100%)
      const left = Math.random() * 100;
      // Random delay (0-2s) for more variation
      const delay = Math.random() * 2;
      // Random duration (3-6s) - much slower for subtle effect
      const duration = 3 + Math.random() * 3;
      // Random top position for better coverage
      const top = Math.random() * 100;

      return {
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      };
    });

    setMeteors(meteorStyles);
  }, [number]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {meteors.map((style, idx) => (
        <span
          key={`meteor-${idx}`}
          className={cn(
            "pointer-events-none absolute h-px w-[50px] rotate-[45deg] rounded-full bg-gradient-to-r from-brand-500/60 via-brand-400/40 to-transparent blur-sm",
            "dark:from-brand-400/70 dark:via-brand-300/50",
            "animate-meteor",
            className
          )}
          style={style}
        />
      ))}
    </div>
  );
};
