"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  initThemeBridge,
  readStoredTheme,
  resolveInitialTheme,
  setTheme,
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
  return resolveInitialTheme();
}

function notifyThemeChange() {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const transitioningRef = useRef(false);

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

  useEffect(() => {
    return initThemeBridge(() => {
      notifyThemeChange();
    });
  }, []);

  const toggleTheme = useCallback(() => {
    if (transitioningRef.current) return;

    const current = readStoredTheme() ?? resolveInitialTheme();
    const next: Theme = current === "dark" ? "light" : "dark";

    transitioningRef.current = true;
    storeTheme(next);
    setTheme(next, { animate: true });
    notifyThemeChange();

    window.setTimeout(() => {
      transitioningRef.current = false;
    }, 730);
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
