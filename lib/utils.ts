import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Constructs a URL by joining the base URL with path segments
 * Handles trailing/leading slashes to prevent double slashes
 */
export function buildUrl(...segments: (string | undefined)[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cleanSegments = segments
    .filter((s): s is string => Boolean(s))
    .map((s) => s.replace(/^\/+|\/+$/g, "")) // Remove leading/trailing slashes
    .filter((s) => s.length > 0); // Remove empty strings

  const base = baseUrl.replace(/\/+$/, ""); // Remove trailing slash from base
  const path = cleanSegments.join("/");

  return path ? `${base}/${path}` : base;
}
