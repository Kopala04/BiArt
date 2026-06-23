"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { usePrintCategories } from "@/components/providers/PrintCategoriesProvider";
import { useLocale, useT } from "@/components/i18n/LanguageProvider";
import { localized, cn } from "@/lib/utils";

export function NavPrintMenu({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const categories = usePrintCategories();
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();

  if (categories.length === 0) return null;

  const isPrintActive = pathname.startsWith("/print");

  if (variant === "mobile") {
    return (
      <li>
        <span className="block px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t.nav.printProducts}
        </span>
        <ul className="space-y-1">
          <li>
            <Link
              href="/print"
              onClick={onNavigate}
              className={cn(
                "block rounded-xl px-4 py-3 text-base font-bold active:bg-slate-100",
                pathname === "/print"
                  ? "bg-amber-50 text-amber-700"
                  : "text-slate-800"
              )}
            >
              {t.print.allCategories}
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/print/${cat.slug}`}
                onClick={onNavigate}
                className={cn(
                  "block rounded-xl px-4 py-3 text-base font-bold active:bg-slate-100",
                  pathname === `/print/${cat.slug}`
                    ? "bg-amber-50 text-amber-700"
                    : "text-slate-800"
                )}
              >
                {localized(locale, cat.name, cat.nameEn)}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold transition",
          isPrintActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
        aria-expanded={isPrintActive}
        aria-haspopup="true"
      >
        {t.nav.printProducts}
        <ChevronDown
          size={14}
          className="transition group-hover:rotate-180 group-focus-within:rotate-180"
          aria-hidden
        />
      </button>

      <div
        className="invisible absolute left-0 top-full z-[300] min-w-[220px] pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
      >
        <div className="overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
          <Link
            href="/print"
            role="menuitem"
            className={cn(
              "block px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50",
              pathname === "/print" && "bg-amber-50 text-amber-800"
            )}
          >
            {t.print.allCategories}
          </Link>
          <div className="my-1 border-t border-slate-100" />
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/print/${cat.slug}`}
              role="menuitem"
              className={cn(
                "block px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50",
                pathname === `/print/${cat.slug}` && "bg-amber-50 text-amber-800"
              )}
            >
              {localized(locale, cat.name, cat.nameEn)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
