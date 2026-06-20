export const locales = ["ka", "en"] as const;

export type Locale = (typeof locales)[number];

/** Georgian is the primary language for the whole site. */
export const defaultLocale: Locale = "ka";

export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  ka: "ქარ",
  en: "ENG",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
