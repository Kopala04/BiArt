"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useT } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  fullWidth = false,
  onDarkHeader = false,
}: {
  className?: string;
  fullWidth?: boolean;
  onDarkHeader?: boolean;
}) {
  const { theme, toggleTheme, mounted } = useTheme();
  const t = useT();

  const isDark = mounted && theme === "dark";
  const label = isDark ? t.theme.light : t.theme.dark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 hover:scale-[1.06] active:scale-[0.96]",
        onDarkHeader
          ? "header-control"
          : "border-border bg-surface-muted text-slate-600 hover:bg-surface dark:text-muted",
        fullWidth && "h-11 w-full",
        className
      )}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
