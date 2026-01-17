"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { fetchExchangeRates } from "@/lib/currency-converter";

type Currency = "USD" | "MYR" | "INR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  getCurrencySymbol: () => string;
  convertPrice: (priceUSD: number) => number;
  convertFromMYR: (priceMYR: number) => number;
  exchangeRates: { MYR: number; INR: number } | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Always start with USD to match server-side render (prevents hydration mismatch)
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [exchangeRates, setExchangeRates] = useState<{ MYR: number; INR: number } | null>(null);

  // MEMORY LEAK FIX: Use refs to track fetch state, preventing duplicate fetches and avoiding stale closures
  const fetchInProgressRef = useRef(false);
  const hasFetchedRef = useRef(false);
  
  // Load from localStorage only after mount (client-side) to prevent hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedCurrency") as Currency;
      if (saved && ["USD", "MYR", "INR"].includes(saved)) {
        setCurrencyState(saved);
      }
      
      // MEMORY LEAK FIX: Prevent duplicate fetches if already in progress or already fetched
      if (fetchInProgressRef.current || hasFetchedRef.current) {
        return;
      }
      
      fetchInProgressRef.current = true;
      hasFetchedRef.current = true;
      
      // Fetch exchange rates from API endpoint (which uses database)
      fetch("/api/gold-prices/public")
        .then((res) => res.json())
        .then((data) => {
          if (data.prices) {
            const myrUsd = data.prices.find((p: any) => p.type === "MYR_USD");
            const myrInr = data.prices.find((p: any) => p.type === "MYR_INR");
            
            if (myrUsd && myrInr) {
              const myrRate = myrUsd.overridePrice ?? myrUsd.fetchedPrice;
              const myrInrRate = myrInr.overridePrice ?? myrInr.fetchedPrice;
              const inrRate = myrRate * myrInrRate;
              
              setExchangeRates({
                MYR: myrRate,
                INR: inrRate,
              });
              fetchInProgressRef.current = false;
              return Promise.resolve();
            }
          }
          // Fallback to fetchExchangeRates if not found in published prices
          return fetchExchangeRates().then((rates) => {
            setExchangeRates({
              MYR: rates.MYR,
              INR: rates.INR,
            });
            fetchInProgressRef.current = false;
          });
        })
        .catch(() => {
          // Fallback to fetchExchangeRates on error
          fetchExchangeRates().then((rates) => {
            setExchangeRates({
              MYR: rates.MYR,
              INR: rates.INR,
            });
            fetchInProgressRef.current = false;
          }).catch(() => {
            fetchInProgressRef.current = false;
          });
        });
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

  // Convert price from USD to selected currency
  const convertPrice = (priceUSD: number): number => {
    if (!exchangeRates) return priceUSD;
    if (currency === "USD") return priceUSD;
    if (currency === "MYR") return priceUSD * exchangeRates.MYR;
    if (currency === "INR") return priceUSD * exchangeRates.INR;
    return priceUSD;
  };

  // Convert price from MYR to selected currency
  // Assumes products are stored in MYR in the database
  const convertFromMYR = (priceMYR: number): number => {
    if (!exchangeRates) return priceMYR;
    if (currency === "MYR") return priceMYR;
    // Convert MYR to USD first, then to target currency
    const priceUSD = priceMYR / exchangeRates.MYR;
    if (currency === "USD") return priceUSD;
    if (currency === "INR") return priceUSD * exchangeRates.INR;
    return priceMYR;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        getCurrencySymbol,
        convertPrice,
        convertFromMYR,
        exchangeRates,
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
