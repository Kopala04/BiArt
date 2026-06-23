"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useT } from "@/components/i18n/LanguageProvider";

export function Footer() {
  const t = useT();

  return (
    <footer className="site-footer mt-auto border-t border-white/15 text-white/85">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Image
              src="/biarti-logo.png"
              alt={t.brand.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-brand text-2xl font-semibold text-white">
              {t.brand.name}
            </span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            {t.footer.tagline}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            {t.footer.navigation}
          </h3>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {t.nav[link.key]}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="transition hover:text-white">
                {t.footer.bookAppointment}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            {t.footer.contact}
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0 text-[color:var(--brand-light)]" />
              <span>{t.footer.email}</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-[color:var(--brand-light)]" />
              <span>{t.footer.phone}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[color:var(--brand-light)]" />
              <span>{t.footer.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/55 sm:flex-row sm:px-6 lg:px-8">
          <p suppressHydrationWarning>
            &copy; {new Date().getFullYear()} {t.brand.name}. {t.footer.rights}
          </p>
          <p>{t.footer.establishedLine}</p>
        </div>
      </div>
    </footer>
  );
}
