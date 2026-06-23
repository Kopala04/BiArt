"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { usePrintCategories } from "@/components/providers/PrintCategoriesProvider";
import { useLocale, useT } from "@/components/i18n/LanguageProvider";
import { localized, cn } from "@/lib/utils";
import {
  desktopNavLinkClass,
  mobileNavLinkClass,
  printDropdownItemClass,
  printDropdownPanelClass,
} from "@/lib/nav-styles";

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
        <span className="block px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
          {t.nav.printProducts}
        </span>
        <ul className="space-y-1">
          <li>
            <Link
              href="/print"
              onClick={onNavigate}
              className={mobileNavLinkClass(pathname === "/print")}
            >
              {t.print.allCategories}
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/print/${cat.slug}`}
                onClick={onNavigate}
                className={mobileNavLinkClass(pathname === `/print/${cat.slug}`)}
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
          desktopNavLinkClass(isPrintActive),
          "inline-flex items-center gap-1"
        )}
        aria-expanded={isPrintActive}
        aria-haspopup="true"
      >
        {t.nav.printProducts}
        <ChevronDown
          size={14}
          className="transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
          aria-hidden
        />
      </button>

      <div
        className="invisible absolute left-0 top-full z-[300] min-w-[220px] pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
      >
        <div className={printDropdownPanelClass}>
          <Link
            href="/print"
            role="menuitem"
            className={cn(
              printDropdownItemClass,
              pathname === "/print" && "bg-amber-50 font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
            )}
          >
            {t.print.allCategories}
          </Link>
          <div className="my-1 border-t border-border" />
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/print/${cat.slug}`}
              role="menuitem"
              className={cn(
                printDropdownItemClass,
                pathname === `/print/${cat.slug}` &&
                  "bg-amber-50 font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
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
