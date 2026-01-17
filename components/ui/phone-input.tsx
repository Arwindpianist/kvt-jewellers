"use client";

import { forwardRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { getCountryByCode, type CountryPhoneData, COUNTRIES_WITH_PHONE } from "@/lib/constants/countries";
import { cn } from "@/lib/utils";

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryChange?: (countryCode: string) => void;
  showCountrySelector?: boolean;
  error?: string;
  helperText?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      value,
      onChange,
      countryCode,
      onCountryChange,
      showCountrySelector = false,
      error,
      helperText,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const country = getCountryByCode(countryCode) || COUNTRIES_WITH_PHONE[0];
    const [displayValue, setDisplayValue] = useState(value || "");

    useEffect(() => {
      // When country changes, update placeholder only if value is empty or doesn't have country code
      if (!value || (!value.startsWith("+") && !value.startsWith(country.dialCode.slice(1)))) {
        setDisplayValue(value || "");
      } else {
        setDisplayValue(value);
      }
    }, [countryCode, value]);

    useEffect(() => {
      setDisplayValue(value || "");
    }, [value]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Allow user to type without forcing country code initially
      // If they start typing a number without +, prepend country code
      if (newValue && !newValue.startsWith("+") && !newValue.startsWith(country.dialCode.slice(1))) {
        // If it's a clean number without country code, we'll let them type
        // and handle formatting on blur or when they finish
        newValue = newValue;
      }

      // If they delete everything, allow empty
      if (!newValue) {
        setDisplayValue("");
        onChange("");
        return;
      }

      setDisplayValue(newValue);
      onChange(newValue);
    };

    const handleBlur = () => {
      // Format phone number on blur if it doesn't start with +
      if (displayValue && !displayValue.startsWith("+")) {
        const formatted = `${country.dialCode} ${displayValue.trim()}`;
        setDisplayValue(formatted);
        onChange(formatted);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
            {label}
          </Label>
        )}
        <div className="relative">
          {showCountrySelector ? (
            <div className="flex gap-2">
              <div className="flex-shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => onCountryChange?.(e.target.value)}
                  disabled={disabled}
                  className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {COUNTRIES_WITH_PHONE.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.dialCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={ref}
                  type="tel"
                  value={displayValue}
                  onChange={handlePhoneChange}
                  onBlur={handleBlur}
                  placeholder={country.placeholder}
                  className={cn("pl-10", error && "border-destructive", className)}
                  disabled={disabled}
                  required={required}
                  {...props}
                />
              </div>
            </div>
          ) : (
            <>
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={ref}
                type="tel"
                value={displayValue}
                onChange={handlePhoneChange}
                onBlur={handleBlur}
                placeholder={country.placeholder}
                className={cn("pl-10", error && "border-destructive", className)}
                disabled={disabled}
                required={required}
                {...props}
              />
            </>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
