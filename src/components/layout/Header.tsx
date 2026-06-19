"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-amber-400">
            BA
          </span>
          <div>
            <span className="block text-lg font-bold tracking-tight text-slate-900">
              Bi Art
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-500">
              Since 2007
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
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Client Login
            </Button>
          </Link>
          <Link href="/book">
            <Button size="sm">Book Now</Button>
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === link.href
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Client Login
                </Button>
              </Link>
              <Link href="/book" onClick={() => setOpen(false)}>
                <Button className="w-full">Book Now</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
