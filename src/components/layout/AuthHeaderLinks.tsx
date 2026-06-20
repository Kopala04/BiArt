"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useT } from "@/components/i18n/LanguageProvider";

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
    return null;
  }

  if (session?.user) {
    const href = session.user.role === "ADMIN" ? "/admin" : "/dashboard";
    const label =
      session.user.role === "ADMIN" ? t.header.admin : t.header.myDashboard;

    if (mobile) {
      return (
        <Link href={href} onClick={onNavigate} className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 active:bg-slate-50">
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
      <Link href="/login" onClick={onNavigate} className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 active:bg-slate-50">
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
