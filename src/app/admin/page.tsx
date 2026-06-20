import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { getServerDictionary } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin Overview" };

export default async function AdminPage() {
  const { locale, t } = await getServerDictionary();
  const [bookingCount, recentBookings, users, media, pendingCount] =
    await Promise.all([
      db.booking.count(),
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { package: true, service: true },
      }),
      db.user.count({ where: { role: "B_USER" } }),
      db.mediaItem.count(),
      db.booking.count({ where: { status: "PENDING" } }),
    ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.admin.overview.title}</h1>
      <p className="mt-1 text-slate-600">{t.admin.overview.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">{t.admin.overview.totalBookings}</p>
          <p className="mt-1 text-3xl font-bold">{bookingCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">{t.admin.overview.bUsers}</p>
          <p className="mt-1 text-3xl font-bold">{users}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">{t.admin.overview.mediaItems}</p>
          <p className="mt-1 text-3xl font-bold">{media}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">{t.admin.overview.pendingBookings}</p>
          <p className="mt-1 text-3xl font-bold">{pendingCount}</p>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">{t.admin.overview.recentBookings}</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">{t.admin.overview.colClient}</th>
                <th className="px-4 py-3 font-medium">{t.admin.overview.colItem}</th>
                <th className="px-4 py-3 font-medium">{t.admin.overview.colDate}</th>
                <th className="px-4 py-3 font-medium">{t.admin.overview.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-slate-50">
                  <td className="px-4 py-3">{b.clientName}</td>
                  <td className="px-4 py-3">
                    {b.package?.name ?? b.service?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(b.date, "P", locale)} {b.timeSlot}
                  </td>
                  <td className="px-4 py-3">
                    {t.statuses[b.status as keyof typeof t.statuses] ?? b.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
