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

