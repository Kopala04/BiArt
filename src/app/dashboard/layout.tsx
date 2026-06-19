import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { SessionProvider } from "@/components/providers/SessionProvider";

const navItems = [
  { href: "/dashboard", label: "Overview" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("B_USER");

  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="font-bold text-slate-900">
              Bi Art
            </Link>
            <nav className="flex gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                Back to Site
              </Link>
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
      </div>
    </SessionProvider>
  );
}
