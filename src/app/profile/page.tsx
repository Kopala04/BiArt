import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { SignOutForm } from "@/components/auth/SignOutForm";
import { getServerDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.profile.title };
}

export default async function ProfilePage() {
  const session = await requireAuth();
  const { t } = await getServerDictionary();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      company: true,
      role: true,
    },
  });

  if (!user) redirect("/login");

  const roleLabel =
    user.role === "ADMIN" ? t.profile.roleAdmin : t.profile.roleClient;

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.profile.title}</h1>
      <p className="mt-1 text-slate-600">{t.profile.subtitle}</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-slate-500">{t.profile.name}</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{user.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t.profile.email}</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t.profile.role}</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{roleLabel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t.profile.phone}</dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {user.phone || t.profile.notProvided}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{t.profile.company}</dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {user.company || t.profile.notProvided}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {user.role === "ADMIN" ? (
          <Link href="/admin">
            <Button>{t.profile.goToAdmin}</Button>
          </Link>
        ) : (
          <Link href="/dashboard">
            <Button>{t.profile.goToDashboard}</Button>
          </Link>
        )}
        <SignOutForm label={t.profile.signOut} />
      </div>

      <p className="mt-6 text-xs text-slate-500">
        {fill(t.profile.signedInAs, { email: user.email })}
      </p>
    </div>
  );
}
