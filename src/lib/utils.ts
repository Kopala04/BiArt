import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ka as kaLocale } from "date-fns/locale";
import type { Locale } from "@/lib/i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Pick the locale-appropriate value for bilingual DB content.
 * The base column holds the primary (Georgian) text; the `en` column is an
 * optional English translation. Falls back to base when English is missing.
 */
export function localized(
  locale: Locale,
  base: string,
  en?: string | null
): string {
  if (locale === "en" && en && en.trim() !== "") {
    return en;
  }
  return base;
}

/** Format a date with locale-aware month/day names (Georgian or English). */
export function formatDate(
  date: Date | string | number,
  fmt: string,
  locale: Locale
): string {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return format(d, fmt, locale === "ka" ? { locale: kaLocale } : undefined);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function parseServices(services: string): string[] {
  try {
    const parsed = JSON.parse(services);
    return Array.isArray(parsed) ? parsed : [services];
  } catch {
    return services.split("\n").filter(Boolean);
  }
}
