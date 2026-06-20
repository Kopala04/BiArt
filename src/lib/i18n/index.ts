import { en, type Dictionary } from "./dictionaries/en";
import { ka } from "./dictionaries/ka";
import { defaultLocale, type Locale } from "./config";

export type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, Dictionary> = { en, ka };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/** Replace {placeholders} in a translation string with provided values. */
export function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}
