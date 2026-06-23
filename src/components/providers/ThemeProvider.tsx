"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  animateThemeChange,
  readStoredTheme,
  storeTheme,
  type Theme,
} from "@/lib/theme";

const THEME_CHANGE_EVENT = "biart-theme-change";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

function getThemeSnapshot(): Theme {
  return readStoredTheme() ?? "light";
}

function notifyThemeChange() {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const animatingRef = useRef(false);

  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    () => "light" as Theme
  );

  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const toggleTheme = useCallback(() => {
    if (animatingRef.current) return;

    const next: Theme = getThemeSnapshot() === "dark" ? "light" : "dark";
    animatingRef.current = true;

    animateThemeChange(next, () => {
      storeTheme(next);
      notifyThemeChange();
      animatingRef.current = false;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
