"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { getAccountPath } from "@/lib/auth-routes";
import { useT } from "@/components/i18n/LanguageProvider";

const mobileLinkClass =
  "inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 active:bg-slate-50";

export function AuthHeaderLinks({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const t = useT();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        className="inline-block h-9 w-24 shrink-0 rounded-lg bg-slate-100"
        aria-hidden
      />
    );
  }

  if (session?.user) {
    const href = getAccountPath(session.user.role as "ADMIN" | "B_USER");
    const label =
      session.user.role === "ADMIN" ? t.header.admin : t.header.myDashboard;

    if (mobile) {
      return (
        <Link href={href} onClick={onNavigate} className={mobileLinkClass}>
          {label}
        </Link>
      );
    }

    return (
      <Link
        href={href}
        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        {label}
      </Link>
    );
  }

  if (mobile) {
    return (
      <Link href="/login" onClick={onNavigate} className={mobileLinkClass}>
        {t.header.clientLogin}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      {t.header.clientLogin}
    </Link>
  );
}
