"use client";

import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "kvt-topbar-dismissed";

export function TopBar() {
  const [times, setTimes] = useState({
    us: "",
    india: "",
    malaysia: "",
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the bar
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const updateTimes = () => {
      const now = new Date();
      
      // US time (EST)
      const usTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const usFormatted = usTime.toLocaleString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      // India time
      const indiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const indiaFormatted = indiaTime.toLocaleString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      // Malaysia time
      const malaysiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
      const malaysiaFormatted = malaysiaTime.toLocaleString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      setTimes({
        us: usFormatted,
        india: indiaFormatted,
        malaysia: malaysiaFormatted,
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  // Format time for mobile (shorter format)
  const formatTimeMobile = (timeStr: string) => {
    // Extract just the time part (HH:MM:SS AM/PM) without weekday
    const parts = timeStr.split(", ");
    return parts.length > 1 ? parts[1] : timeStr;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-b bg-brand-700 text-white overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2 relative">
            <button
              onClick={handleDismiss}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-brand-700"
              aria-label="Dismiss top bar"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Mobile View */}
            <div className="flex items-center justify-center gap-3 text-xs md:hidden pr-8">
              <div className="flex items-center gap-1">
                <span>🇲🇾</span>
                <span className="font-medium">{formatTimeMobile(times.malaysia)}</span>
              </div>
              <span className="text-white/40">•</span>
              <div className="flex items-center gap-1">
                <span>🇮🇳</span>
                <span className="font-medium">{formatTimeMobile(times.india)}</span>
              </div>
            </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-4 text-xs pr-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>🇺🇸</span>
              <span>{times.us}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🇮🇳</span>
              <span>{times.india}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🇲🇾</span>
              <span>{times.malaysia}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            <span>Phone:</span>
            <a 
              href="tel:+60326029916" 
              className="font-medium hover:underline"
            >
              03 2602 9916
            </a>
          </div>
        </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
