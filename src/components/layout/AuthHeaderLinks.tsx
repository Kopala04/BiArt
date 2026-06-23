"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { getAccountPath } from "@/lib/auth-routes";
import { useT } from "@/components/i18n/LanguageProvider";

const mobileLinkClass =
  "interactive-scale inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface px-5 py-3.5 text-sm font-semibold text-foreground transition-transform duration-200 hover:scale-[1.02] hover:bg-surface-muted active:scale-[0.98]";

const desktopLinkClass =
  "nav-link rounded-lg px-3 py-2 text-sm font-medium text-muted transition-transform duration-200 hover:scale-105 hover:bg-surface-muted hover:font-semibold hover:text-foreground active:scale-95";

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
        className="inline-block h-9 w-24 shrink-0 rounded-lg bg-surface-muted"
        aria-hidden
      />
    );
  }

  if (session?.user) {
    const role = session.user.role;
    const href =
      role === "ADMIN"
        ? getAccountPath("ADMIN")
        : getAccountPath("B_USER");
    const label =
      role === "ADMIN" ? t.header.admin : t.header.myDashboard;

    if (mobile) {
      return (
        <Link href={href} onClick={onNavigate} className={mobileLinkClass}>
          {label}
        </Link>
      );
    }

    return (
      <Link href={href} className={desktopLinkClass}>
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
    <Link href="/login" className={desktopLinkClass}>
      {t.header.clientLogin}
    </Link>
  );
}
