import Image from "next/image";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const { t } = await getServerDictionary();

  return (
    <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
              <Image
                src="/biarti-logo.png"
                alt={t.brand.name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
              <span className="font-brand">{t.brand.name}</span>
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                {t.profile.backToSite}
              </Link>
              <LanguageSwitcher />
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
