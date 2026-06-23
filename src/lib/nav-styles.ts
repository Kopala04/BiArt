import { cn } from "@/lib/utils";

/** Shared classes for the always-dark site header bar. */
export const headerBarClass =
  "site-header shrink-0 border-b border-slate-700/50 bg-[#283142]/95 text-slate-200 backdrop-blur-md";

export const headerInnerClass = "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8";

export function desktopNavLinkClass(active: boolean) {
  return cn(
    "nav-link relative overflow-hidden rounded-lg px-3 py-2 text-sm font-bold text-slate-300 transition-all duration-300 ease-out",
    "hover:scale-[1.04] hover:bg-white/10 hover:text-white hover:shadow-[0_0_16px_rgba(212,160,84,0.45)]",
    "hover:font-extrabold active:scale-[0.98]",
    active && "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
  );
}

export function mobileNavLinkClass(active: boolean) {
  return cn(
    "nav-link relative overflow-hidden block rounded-xl px-4 py-3.5 text-base font-bold transition-all duration-300 ease-out",
    "hover:scale-[1.02] hover:bg-white/10 hover:text-white hover:shadow-[0_0_14px_rgba(212,160,84,0.35)]",
    "hover:font-extrabold active:scale-[0.98]",
    active
      ? "bg-amber-500/15 text-amber-200 shadow-[0_0_12px_rgba(212,160,84,0.25)]"
      : "text-slate-300"
  );
}

export const headerCtaClass =
  "interactive-scale rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_18px_rgba(212,160,84,0.55)] hover:scale-[1.04] active:scale-[0.98]";
