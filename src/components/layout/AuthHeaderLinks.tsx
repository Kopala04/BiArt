"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { getAccountPath } from "@/lib/auth-routes";
import { useT } from "@/components/i18n/LanguageProvider";

const mobileLinkDark =
  "interactive-scale inline-flex w-full items-center justify-center rounded-lg border border-slate-600 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-white/10 hover:text-white hover:shadow-[0_0_14px_rgba(212,160,84,0.35)] active:scale-[0.98]";

const mobileLinkLight =
  "interactive-scale inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition-all duration-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

const desktopLinkDark =
  "nav-link rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:scale-[1.04] hover:bg-white/10 hover:font-bold hover:text-white hover:shadow-[0_0_14px_rgba(212,160,84,0.4)] active:scale-[0.98]";

const desktopLinkLight =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:scale-[1.04] hover:bg-slate-100 hover:font-semibold active:scale-[0.98]";

export function AuthHeaderLinks({
  mobile = false,
  onNavigate,
  onDarkHeader = false,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
  onDarkHeader?: boolean;
}) {
  const t = useT();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        className="inline-block h-9 w-24 shrink-0 rounded-lg bg-white/10"
        aria-hidden
      />
    );
  }

  const mobileClass = onDarkHeader ? mobileLinkDark : mobileLinkLight;
  const desktopClass = onDarkHeader ? desktopLinkDark : desktopLinkLight;

  if (session?.user) {
    const href = getAccountPath(session.user.role as "ADMIN" | "B_USER");
    const label =
      session.user.role === "ADMIN" ? t.header.admin : t.header.myDashboard;

    if (mobile) {
      return (
        <Link href={href} onClick={onNavigate} className={mobileClass}>
          {label}
        </Link>
      );
    }

    return (
      <Link href={href} className={desktopClass}>
        {label}
      </Link>
    );
  }

  if (mobile) {
    return (
      <Link href="/login" onClick={onNavigate} className={mobileClass}>
        {t.header.clientLogin}
      </Link>
    );
  }

  return (
    <Link href="/login" className={desktopClass}>
      {t.header.clientLogin}
    </Link>
  );
}
