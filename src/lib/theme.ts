/**
 * Theme bridge — state, persistence, system preference, and transition orchestration.
 * Color values live in globals.css; this module only handles environment shifts.
 */

export const THEME_STORAGE_KEY = "biart-theme";

export const THEME_TRANSITION_MS = 650;
export const THEME_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

export type Theme = "light" | "dark";

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

/** Stored preference wins; otherwise align with OS. */
export function resolveInitialTheme(): Theme {
  return readStoredTheme() ?? getSystemTheme();
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function clearStoredTheme(): void {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Shift the page environment to `theme`.
 * When `animate` is true, enables the CSS transition layer before toggling class.
 */
export function setTheme(theme: Theme, options?: { animate?: boolean }): void {
  const root = document.documentElement;
  const shouldAnimate = options?.animate !== false && !prefersReducedMotion();

  if (!shouldAnimate) {
    root.classList.remove("theme-transitioning");
    applyTheme(theme);
    return;
  }

  root.classList.add("theme-transitioning");
  applyTheme(theme);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    root.classList.remove("theme-transitioning");
    root.removeEventListener("transitionend", onTransitionEnd);
    window.clearTimeout(fallback);
  };

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== root) return;
    if (!event.propertyName.startsWith("--")) return;
    finish();
  };

  root.addEventListener("transitionend", onTransitionEnd);
  const fallback = window.setTimeout(finish, THEME_TRANSITION_MS + 80);
}

/**
 * Listen for OS theme changes. Only applies when the user has no stored preference.
 */
export function subscribeSystemTheme(
  onSystemChange: (theme: Theme) => void
): () => void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = () => {
    if (readStoredTheme() !== null) return;
    const next = mq.matches ? "dark" : "light";
    setTheme(next, { animate: true });
    onSystemChange(next);
  };

  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

/** Boot the bridge on the client — idempotent. */
export function initThemeBridge(onChange?: (theme: Theme) => void): () => void {
  const theme = resolveInitialTheme();
  applyTheme(theme);

  return subscribeSystemTheme((next) => {
    onChange?.(next);
  });
}
