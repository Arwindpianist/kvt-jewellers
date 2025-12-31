"use client";

import { useEffect, useState } from "react";

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

  return (
    <div className="border-b bg-brand-700 text-white">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            <span>🇺🇸</span>
            <span>{times.us}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🇮🇳</span>
            <span>{times.india}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🇲🇾</span>
            <span>{times.malaysia}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Phone: </span>
          <a href="tel:+60326029916" className="hover:underline">
            03 2602 9916
          </a>
        </div>
      </div>
    </div>
  );
}

