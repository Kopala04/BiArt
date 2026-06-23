import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ka as kaLocale } from "date-fns/locale";
import type { Locale } from "@/lib/i18n/config";
import {
  CONSULTATION_CREDIT_TIME_SLOT_VARIANTS,
  CONSULTATION_SERVICE_SLUG,
  ORDER_TIME_SLOT,
} from "@/lib/constants";

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

export function formatPrice(price: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

/** Render a booking time slot, localizing the consultation-credit sentinel. */
export function formatTimeSlot(
  timeSlot: string,
  creditAppliedLabel: string,
  orderPlacedLabel?: string
): string {
  if (
    CONSULTATION_CREDIT_TIME_SLOT_VARIANTS.includes(
      timeSlot as (typeof CONSULTATION_CREDIT_TIME_SLOT_VARIANTS)[number]
    )
  ) {
    return creditAppliedLabel;
  }
  if (timeSlot === ORDER_TIME_SLOT && orderPlacedLabel) {
    return orderPlacedLabel;
  }
  return timeSlot;
}

/** Route for a bookable service — consultation uses scheduling, others use simple order. */
export function serviceActionHref(slug: string): string {
  if (slug === CONSULTATION_SERVICE_SLUG) {
    return `/book?service=${slug}`;
  }
  return `/order?service=${slug}`;
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
