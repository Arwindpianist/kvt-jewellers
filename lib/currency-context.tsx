"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "USD" | "MYR" | "INR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Always start with USD to match server-side render (prevents hydration mismatch)
  const [currency, setCurrencyState] = useState<Currency>("USD");

  // Load from localStorage only after mount (client-side) to prevent hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedCurrency") as Currency;
      if (saved && ["USD", "MYR", "INR"].includes(saved)) {
        setCurrencyState(saved);
      }
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCurrency", newCurrency);
    }
  };

  const formatPrice = (price: number): string => {
    const currencyMap: Record<Currency, { code: string; locale: string }> = {
      USD: { code: "USD", locale: "en-US" },
      MYR: { code: "MYR", locale: "en-MY" },
      INR: { code: "INR", locale: "en-IN" },
    };

    const config = currencyMap[currency];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getCurrencySymbol = (): string => {
    const symbols: Record<Currency, string> = {
      USD: "$",
      MYR: "RM",
      INR: "₹",
    };
    return symbols[currency];
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
