import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { db } from "@/lib/db";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/users", label: "B Users" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("ADMIN");

  const [bookingsCount, messagesCount] = await Promise.all([
    db.booking.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { read: false } }),
  ]);

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-slate-100">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:block">
          <div className="p-6">
            <Link href="/" className="text-lg font-bold">
              Bi Art
            </Link>
            <p className="mt-1 text-xs text-slate-400">Admin Panel</p>
          </div>
          <nav className="space-y-1 px-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {item.label}
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
            <Link href="/admin" className="font-bold">
              Bi Art Admin
            </Link>
            <nav className="mt-3 flex flex-wrap gap-2 text-xs">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
                >
                  {item.label}
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
