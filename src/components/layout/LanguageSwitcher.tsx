"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/actions/locale";
import { locales, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  fullWidth = false,
}: {
  className?: string;
  fullWidth?: boolean;
}) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: Locale) => {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5",
        fullWidth && "w-full justify-center",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => change(l)}
          disabled={pending}
          aria-pressed={l === locale}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60",
            l === locale
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
