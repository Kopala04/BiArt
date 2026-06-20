import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("B_USER");
  const { t } = await getServerDictionary();

  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="font-bold text-slate-900">
              {t.brand.name}
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-slate-900"
              >
                {t.dashboard.overview}
              </Link>
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                {t.dashboard.backToSite}
              </Link>
              <LanguageSwitcher />
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
      </div>
    </SessionProvider>
  );
}
