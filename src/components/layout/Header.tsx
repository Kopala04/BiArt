"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AuthHeaderLinks } from "@/components/layout/AuthHeaderLinks";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NavPrintMenu } from "@/components/layout/NavPrintMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useT } from "@/components/i18n/LanguageProvider";

const mobileBtnPrimary =
  "inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-5 py-3.5 text-sm font-semibold text-slate-950 active:bg-amber-400";

export function Header() {
  const t = useT();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [headerH, setHeaderH] = useState(76);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const syncHeight = () => {
      const height = header.getBoundingClientRect().height;
      setHeaderH(height);
      document.documentElement.style.setProperty("--header-h", `${height}px`);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";
    return () => {
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.width = "";
      style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <div className="fixed top-0 inset-x-0 z-[200] flex flex-col">
      <header
        ref={headerRef}
        className="shrink-0 border-b border-slate-200 bg-white md:bg-white/95 md:backdrop-blur-md dark:border-slate-800 dark:bg-slate-900 dark:md:bg-slate-900/95"
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
              <span className="font-brand block truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {t.brand.name}
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                  "rounded-lg px-3 py-2 text-sm font-bold transition",
                  pathname === link.href
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {t.nav[link.key]}
              </Link>
            ))}
            <NavPrintMenu />
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <LanguageSwitcher />
            <AuthHeaderLinks />
            <Link
              href="/book"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              {t.header.bookNow}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              type="button"
              className="relative flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:active:bg-slate-700"
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
        </div>
      </header>

      {open && (
        <div
          id="mobile-menu"
          className="flex min-h-0 overflow-hidden md:hidden"
          style={{ height: `calc(100dvh - ${headerH}px)` }}
        >
          <button
            type="button"
            className="min-w-0 flex-1 bg-slate-950/40 touch-manipulation"
            onClick={close}
            aria-label={t.header.dismissMenu}
          />

          <aside className="flex h-full w-[min(100%,320px)] shrink-0 flex-col bg-white shadow-2xl dark:bg-slate-900">
            <div className="shrink-0 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.header.menu}
              </span>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      className={cn(
                        "block rounded-xl px-4 py-3.5 text-base font-bold active:bg-slate-100",
                        pathname === link.href
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          : "text-slate-800 dark:text-slate-200"
                      )}
                    >
                      {t.nav[link.key]}
                    </Link>
                  </li>
                ))}
                <NavPrintMenu variant="mobile" onNavigate={close} />
              </ul>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                <AuthHeaderLinks mobile onNavigate={close} />
                <Link href="/book" onClick={close} className={mobileBtnPrimary}>
                  {t.header.bookNow}
                </Link>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
