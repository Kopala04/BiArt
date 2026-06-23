"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { usePrintCategories } from "@/components/providers/PrintCategoriesProvider";
import { useLocale, useT } from "@/components/i18n/LanguageProvider";
import { localized, cn } from "@/lib/utils";
import { desktopNavLinkClass, mobileNavLinkClass } from "@/lib/nav-styles";

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
        <span className="block px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
          className="transition duration-300 group-hover:rotate-180 group-focus-within:rotate-180"
          aria-hidden
        />
      </button>

      <div
        className="invisible absolute left-0 top-full z-[300] min-w-[220px] pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
      >
        <div className="overflow-hidden rounded-xl border border-slate-600/60 bg-[#1e2533] py-1 shadow-xl shadow-black/30">
          <Link
            href="/print"
            role="menuitem"
            className={cn(
              "block px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/10 hover:pl-5 hover:font-bold hover:text-white hover:shadow-[0_0_12px_rgba(212,160,84,0.3)]",
              pathname === "/print" && "bg-white/10 font-bold text-amber-200"
            )}
          >
            {t.print.allCategories}
          </Link>
          <div className="my-1 border-t border-slate-700/60" />
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/print/${cat.slug}`}
              role="menuitem"
              className={cn(
                "block px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/10 hover:pl-5 hover:font-bold hover:text-white hover:shadow-[0_0_12px_rgba(212,160,84,0.3)]",
                pathname === `/print/${cat.slug}` &&
                  "bg-white/10 font-bold text-amber-200"
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
