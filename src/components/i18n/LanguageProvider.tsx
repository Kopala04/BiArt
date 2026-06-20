"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <LanguageContext.Provider value={{ locale, t: dict }}>
      {children}
    </LanguageContext.Provider>
  );
}

function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("Language hooks must be used within a LanguageProvider");
  }
  return ctx;
}

/** Returns the active translation dictionary for client components. */
export function useT(): Dictionary {
  return useLanguage().t;
}

export function useLocale(): Locale {
  return useLanguage().locale;
}
