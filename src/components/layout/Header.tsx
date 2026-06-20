"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AuthHeaderLinks } from "@/components/layout/AuthHeaderLinks";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useT } from "@/components/i18n/LanguageProvider";

const mobileBtnPrimary =
  "inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-5 py-3.5 text-sm font-semibold text-slate-950 active:bg-amber-400";
const mobileBtnOutline =
  "inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 active:bg-slate-50";

export function Header() {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-slate-200 bg-white md:bg-white/95 md:backdrop-blur-md",
          open && "z-[160]"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 shrink items-center gap-2">
            <Image
              src="/biarti-logo.png"
              alt={t.brand.name}
              width={40}
              height={40}
              priority
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <span className="font-display block truncate text-xl font-semibold tracking-tight text-slate-900">
                Bi Art
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-500">
                {t.brand.since}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  pathname === link.href
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {t.nav[link.key]}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <AuthHeaderLinks />
            <Link
              href="/book"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              {t.header.bookNow}
            </Link>
          </div>

          <button
            type="button"
            className="relative z-[200] flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 active:bg-slate-100 md:hidden"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
          >
            {open ? (
              <X size={22} strokeWidth={2} className="pointer-events-none" />
            ) : (
              <Menu size={22} strokeWidth={2} className="pointer-events-none" />
            )}
          </button>
        </div>
      </header>

      {mounted &&
        open &&
        createPortal(
          <div id="mobile-menu" className="fixed inset-0 z-[150] flex md:hidden">
            <button
              type="button"
              className="min-w-0 flex-1 bg-slate-950/40 touch-manipulation"
              onClick={close}
              aria-label={t.header.dismissMenu}
            />

            <div className="flex h-full w-[min(100%,320px)] shrink-0 flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <span className="text-sm font-semibold text-slate-900">
                  {t.header.menu}
                </span>
                <LanguageSwitcher />
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-4">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className={cn(
                          "block rounded-xl px-4 py-3.5 text-base font-medium active:bg-slate-100",
                          pathname === link.href
                            ? "bg-amber-50 text-amber-700"
                            : "text-slate-800"
                        )}
                      >
                        {t.nav[link.key]}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                  <AuthHeaderLinks mobile onNavigate={close} />
                  <Link href="/book" onClick={close} className={mobileBtnPrimary}>
                    {t.header.bookNow}
                  </Link>
                </div>
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
