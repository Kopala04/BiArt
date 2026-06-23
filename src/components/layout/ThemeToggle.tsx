"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useT } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  fullWidth = false,
}: {
  className?: string;
  fullWidth?: boolean;
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
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-slate-600 transition hover:bg-surface dark:text-muted",
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
