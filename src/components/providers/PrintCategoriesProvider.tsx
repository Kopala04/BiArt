"use client";

import { createContext, useContext } from "react";

export type PrintNavCategory = {
  slug: string;
  name: string;
  nameEn: string | null;
};

const PrintCategoriesContext = createContext<PrintNavCategory[]>([]);

export function PrintCategoriesProvider({
  categories,
  children,
}: {
  categories: PrintNavCategory[];
  children: React.ReactNode;
}) {
  return (
    <PrintCategoriesContext.Provider value={categories}>
      {children}
    </PrintCategoriesContext.Provider>
  );
}

export function usePrintCategories() {
  return useContext(PrintCategoriesContext);
}
