export type GoldPriceType = "GOLD_C" | "GOLD_USD" | "SILVER_C" | "SILVER_USD" | "SING" | "MYR_USD" | "MYR_INR";

export type Currency = "MYR" | "USD" | "INR";

export interface GoldPrice {
  id: string;
  type: GoldPriceType;
  fetchedPrice: number;
  overridePrice?: number;
  isPublished: boolean;
  lastUpdated: Date;
  currency: Currency;
  // For live rates table
  bid?: number;
  ask?: number;
  high?: number;
  low?: number;
  // For product rates table
  buy?: number;
  sell?: number;
  // Buy/Sell percentage configuration
  buyPercentage?: number; // Percentage to subtract from base price for buying
  sellPercentage?: number; // Percentage to add to base price for selling
  // Exchange rate configuration
  usePresetExchangeRate?: boolean;
  presetExchangeRate?: number; // Manual exchange rate override
}

export interface GoldPriceResponse {
  prices: GoldPrice[];
  lastFetched: Date;
}

export interface ExternalGoldPriceData {
  gold?: number;
  silver?: number;
  currency?: string;
  timestamp?: number;
}

