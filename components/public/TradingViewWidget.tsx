"use client";

import React, { useEffect, useRef, memo } from "react";
import { useTheme } from "next-themes";
import { useCurrency } from "@/lib/currency-context";

type Currency = "USD" | "MYR" | "INR";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const { theme, systemTheme } = useTheme();
  const { currency } = useCurrency();
  const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");

  // Get TradingView symbols based on currency
  const getSymbols = (curr: Currency): string[][] => {
    // TradingView uses the format: TVC:GOLD|1D|CURRENCY for currency conversion
    // For USD (default), we don't need to specify currency
    if (curr === "USD") {
      return [["TVC:GOLD|1D"], ["TVC:SILVER|1D"]];
    }
    // For other currencies, append |CURRENCY to the symbol
    return [
      [`TVC:GOLD|1D|${curr}`],
      [`TVC:SILVER|1D|${curr}`]
    ];
  };

  useEffect(() => {
    if (!container.current) return;

    // Clear the widget container div to prevent duplicate graphs
    const widgetDiv = container.current.querySelector(".tradingview-widget-container__widget");
    if (widgetDiv) {
      widgetDiv.innerHTML = "";
    }

    // Remove any existing scripts
    const existingScripts = container.current.querySelectorAll("script");
    existingScripts.forEach((script) => script.remove());

    // Brand colors matching the website
    const brandPurple = "#521540"; // Main brand color
    const brandPurpleDark = "#421133"; // Brand 600
    const goldColor = "#fac30f"; // Gold color
    const goldColorDark = "#c89c0c"; // Gold 600

    // Light mode colors
    const lightBg = "#ffffff";
    const lightText = "#1a1a1a"; // Dark text on light bg
    const lightGrid = "rgba(0, 0, 0, 0.05)";
    const lightMuted = "rgba(82, 21, 64, 0.1)"; // Brand purple with opacity

    // Dark mode colors
    const darkBg = "#0d1117"; // hsl(222.2 84% 4.9%) converted to hex
    const darkText = "#f0f0f0"; // Light text on dark bg
    const darkGrid = "rgba(255, 255, 255, 0.05)";
    const darkMuted = "rgba(66, 17, 51, 0.3)"; // Brand purple dark with opacity

    const config = {
      lineWidth: 2,
      lineType: 0,
      chartType: "area",
      fontColor: isDark ? darkText : lightText,
      gridLineColor: isDark ? darkGrid : lightGrid,
      volumeUpColor: isDark
        ? "rgba(250, 195, 15, 0.4)"
        : "rgba(250, 195, 15, 0.3)", // Gold with opacity
      volumeDownColor: isDark
        ? "rgba(82, 21, 64, 0.4)"
        : "rgba(82, 21, 64, 0.3)", // Brand purple with opacity
      backgroundColor: isDark ? darkBg : lightBg,
      widgetFontColor: isDark ? darkText : lightText,
      upColor: goldColor, // Gold for up movements
      downColor: brandPurple, // Brand purple for down movements
      borderUpColor: goldColorDark,
      borderDownColor: brandPurpleDark,
      wickUpColor: goldColor,
      wickDownColor: brandPurple,
      colorTheme: isDark ? "dark" : "light",
      isTransparent: false,
      locale: "en",
      chartOnly: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Inter', 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
      valuesTracking: "1",
      changeMode: "price-and-percent",
      symbols: getSymbols(currency),
      dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
      fontSize: "10",
      headerFontSize: "medium",
      autosize: true,
      width: "100%",
      height: "100%",
      noTimeScale: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
    };

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    // Append script to the widget container div
    const targetDiv = container.current.querySelector(".tradingview-widget-container__widget");
    if (targetDiv) {
      targetDiv.appendChild(script);
    } else {
      // Fallback: append to container if widget div doesn't exist
      container.current.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (container.current) {
        // Clear widget container
        const cleanupDiv = container.current.querySelector(".tradingview-widget-container__widget");
        if (cleanupDiv) {
          cleanupDiv.innerHTML = "";
        }
        // Remove all scripts
        const scripts = container.current.querySelectorAll("script");
        scripts.forEach((s) => {
          if (s.parentNode) {
            s.parentNode.removeChild(s);
          }
        });
      }
    };
  }, [isDark, currency]);

  return (
    <div className="tradingview-widget-container w-full h-full flex flex-col" ref={container}>
      <div className="tradingview-widget-container__widget flex-1 min-h-0"></div>
      <div className="tradingview-widget-copyright text-xs text-muted-foreground mt-2 text-center">
        <a
          href="https://www.tradingview.com/markets/"
          rel="noopener nofollow"
          target="_blank"
          className="text-brand-600 hover:text-brand-700 hover:underline"
        >
          <span className="text-brand-500">World markets</span>
        </a>{" "}
        by TradingView
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
