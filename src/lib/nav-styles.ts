import { cn } from "@/lib/utils";

/** Theme-aware header — light/cream in light mode, hero-matched dark in dark mode. */
export const headerBarClass =
  "site-header shrink-0 border-b border-border bg-surface/95 text-foreground backdrop-blur-md dark:border-slate-800/60 dark:bg-[color:var(--hero-bg)]/95";

export const headerInnerClass =
  "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8";

export function desktopNavLinkClass(active: boolean) {
  return cn(
    "nav-link rounded-lg px-3 py-2 text-sm font-bold text-muted transition-transform duration-200 ease-out",
    "hover:scale-105 hover:bg-surface-muted hover:text-foreground hover:font-extrabold active:scale-95",
    active && "bg-surface-muted text-foreground"
  );
}

export function mobileNavLinkClass(active: boolean) {
  return cn(
    "nav-link block rounded-xl px-4 py-3.5 text-base font-bold transition-transform duration-200 ease-out",
    "hover:scale-[1.02] active:scale-[0.98]",
    active
      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
      : "text-slate-800 hover:bg-surface-muted hover:font-extrabold dark:text-slate-300 dark:hover:bg-surface-muted"
  );
}

export const headerCtaClass =
  "interactive-scale rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-transform duration-200 hover:scale-105 hover:bg-amber-400 active:scale-95";

export const printDropdownPanelClass =
  "overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg";

export const printDropdownItemClass =
  "block px-4 py-2.5 text-sm font-medium text-muted transition-transform duration-200 hover:scale-[1.02] hover:bg-surface-muted hover:font-semibold hover:text-foreground active:scale-95";
