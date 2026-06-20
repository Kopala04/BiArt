import Image from "next/image";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { db } from "@/lib/db";
import { getServerDictionary } from "@/lib/i18n/server";

const adminNav = [
  { href: "/admin", key: "overview" },
  { href: "/admin/bookings", key: "bookings" },
  { href: "/admin/packages", key: "packages" },
  { href: "/admin/services", key: "services" },
  { href: "/admin/users", key: "users" },
  { href: "/admin/media", key: "media" },
  { href: "/admin/messages", key: "messages" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("ADMIN");
  const { t } = await getServerDictionary();

  const [bookingsCount, messagesCount] = await Promise.all([
    db.booking.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { read: false } }),
  ]);

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-slate-100">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:block">
          <div className="flex items-start justify-between gap-2 p-6">
            <div>
              <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                <Image
                  src="/biarti-logo.png"
                  alt={t.brand.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
                {t.brand.name}
              </Link>
              <p className="mt-1 text-xs text-slate-400">{t.admin.panel}</p>
            </div>
            <LanguageSwitcher />
          </div>
          <nav className="space-y-1 px-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {t.admin.nav[item.key]}
                {item.href === "/admin/bookings" && bookingsCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-slate-950">
                    {bookingsCount}
                  </span>
                )}
                {item.href === "/admin/messages" && messagesCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-slate-950">
                    {messagesCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-4 lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <Link href="/admin" className="flex items-center gap-2 font-bold">
                <Image
                  src="/biarti-logo.png"
                  alt={t.brand.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
                {t.admin.adminBrand}
              </Link>
              <LanguageSwitcher />
            </div>
            <nav className="mt-3 flex flex-wrap gap-2 text-xs">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
                >
                  {t.admin.nav[item.key]}
                </Link>
              ))}
            </nav>
          </header>
          <main className="p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
