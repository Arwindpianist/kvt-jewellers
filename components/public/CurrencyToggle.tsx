"use client";

import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/lib/currency-context";
import { Check } from "lucide-react";

type Currency = "USD" | "MYR" | "INR";

const currencyLabels: Record<Currency, { label: string; symbol: string }> = {
  USD: { label: "US Dollar", symbol: "$" },
  MYR: { label: "Malaysian Ringgit", symbol: "RM" },
  INR: { label: "Indian Rupee", symbol: "₹" },
};

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white/90 hover:bg-brand-700 h-8 w-8"
        >
          <DollarSign className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(["USD", "MYR", "INR"] as Currency[]).map((curr) => (
          <DropdownMenuItem
            key={curr}
            onClick={() => setCurrency(curr)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{currencyLabels[curr].symbol}</span>
              <span className="text-sm">{currencyLabels[curr].label}</span>
            </div>
            {currency === curr && (
              <Check className="h-4 w-4 text-brand-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
