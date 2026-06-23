export const THEME_STORAGE_KEY = "biart-theme";

export type Theme = "light" | "dark";

/** Keep in sync with --background / --hero-bg in globals.css */
export const THEME_WIPE_COLORS: Record<Theme, string> = {
  light: "#faf8f4",
  dark: "#252c38",
};

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function animateThemeChange(
  next: Theme,
  onComplete: () => void
): void {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion) {
    applyTheme(next);
    onComplete();
    return;
  }

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "theme-wipe";
  overlay.style.backgroundColor = THEME_WIPE_COLORS[next];
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add("theme-wipe--active");
    });
  });

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    applyTheme(next);
    overlay.remove();
    onComplete();
  };

  overlay.addEventListener("transitionend", finish, { once: true });
  window.setTimeout(finish, 1000);
}
