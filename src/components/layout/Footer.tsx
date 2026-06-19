import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-slate-950">
              BA
            </span>
            <span className="text-xl font-bold text-white">Bi Art</span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            Premium advertising and media production agency established in 2007.
            We help businesses grow through strategic branding, creative
            campaigns, and professional media content.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Navigation
          </h3>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-amber-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="transition hover:text-amber-400">
                Book Appointment
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Contact
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <span>hello@biart.com</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <span>123 Creative Avenue, Business District</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Bi Art. All rights reserved.</p>
          <p>Established 2007 — Advertising &amp; Media Production</p>
        </div>
      </div>
    </footer>
  );
}
