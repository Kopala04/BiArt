"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function AuthHeaderLinks({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session?.user) {
    const href = session.user.role === "ADMIN" ? "/admin" : "/dashboard";
    const label = session.user.role === "ADMIN" ? "Admin" : "My Dashboard";

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
        Client Login
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      Client Login
    </Link>
  );
}
