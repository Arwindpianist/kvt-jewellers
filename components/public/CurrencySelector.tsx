"use client";

import { Globe } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Currency = "USD" | "MYR" | "INR";

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  className = "",
}: CurrencySelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Currency:</span>
      <ToggleGroup
        type="single"
        value={selectedCurrency}
        onValueChange={(value) => {
          if (value) onCurrencyChange(value as Currency);
        }}
        className="border border-border bg-muted/30 p-1 rounded-lg"
      >
        {(["USD", "MYR", "INR"] as Currency[]).map((currency) => (
          <ToggleGroupItem
            key={currency}
            value={currency}
            aria-label={`Select ${currency}`}
          >
            {currency}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
