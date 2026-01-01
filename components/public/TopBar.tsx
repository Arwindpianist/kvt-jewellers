"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";

export function TopBar() {
  const [times, setTimes] = useState({
    us: "",
    india: "",
    malaysia: "",
  });

  useEffect(() => {
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
  }, []);

  // Format time for mobile (shorter format)
  const formatTimeMobile = (timeStr: string) => {
    // Extract just the time part (HH:MM:SS AM/PM) without weekday
    const parts = timeStr.split(", ");
    return parts.length > 1 ? parts[1] : timeStr;
  };

  return (
    <div className="border-b bg-brand-700 text-white">
      <div className="container mx-auto px-4 py-2">
        {/* Mobile View */}
        <div className="flex flex-col gap-2 md:hidden">
          {/* Phone Number - Prominent on Mobile */}
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-4 w-4" />
            <a 
              href="tel:+60326029916" 
              className="text-sm font-semibold hover:underline active:text-brand-200"
            >
              03 2602 9916
            </a>
          </div>
          
          {/* Time Zones - Simplified on Mobile */}
          <div className="flex items-center justify-center gap-3 text-xs">
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
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-4 text-xs">
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
    </div>
  );
}
