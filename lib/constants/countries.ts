/**
 * Country data with phone number formats
 */

export interface CountryPhoneData {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  pattern?: string;
}

export const COUNTRIES_WITH_PHONE: CountryPhoneData[] = [
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    flag: "🇲🇾",
    placeholder: "+60 12-345 6789",
    pattern: "^\\+60\\s?[1-9]\\d{1,2}-?\\d{3,4}-?\\d{4}$",
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    placeholder: "+91 98765 43210",
    pattern: "^\\+91\\s?[6-9]\\d{9}$",
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    placeholder: "+65 9123 4567",
    pattern: "^\\+65\\s?[689]\\d{7}$",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    placeholder: "+1 (555) 123-4567",
    pattern: "^\\+1\\s?\\(?[2-9]\\d{2}\\)?\\s?-?\\d{3}-?\\d{4}$",
  },
  {
    code: "OTHER",
    name: "Other",
    dialCode: "+",
    flag: "🌍",
    placeholder: "+[country code] [number]",
  },
];

export function getCountryByCode(code: string): CountryPhoneData | undefined {
  return COUNTRIES_WITH_PHONE.find((country) => country.code === code);
}

export function formatPhoneNumber(phone: string, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  if (!country || !phone) return phone;

  // If phone already starts with dial code, return as is
  if (phone.startsWith("+")) return phone;

  // If phone starts with dial code without +, add +
  if (phone.startsWith(country.dialCode.slice(1))) {
    return `+${phone}`;
  }

  // Otherwise prepend dial code
  return `${country.dialCode} ${phone}`;
}
