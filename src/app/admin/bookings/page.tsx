import { db } from "@/lib/db";
import { BookingActions } from "@/components/admin/BookingActions";
import { getServerDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n";
import { formatDate, localized } from "@/lib/utils";

export const metadata = { title: "Manage Bookings" };

export default async function AdminBookingsPage() {
  const { locale, t } = await getServerDictionary();
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { package: true, service: true, user: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.admin.bookings.title}</h1>
      <p className="mt-1 text-slate-600">
        {fill(t.admin.bookings.totalCount, { count: bookings.length })}
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium">{t.admin.bookings.colClient}</th>
              <th className="px-4 py-3 font-medium">{t.admin.bookings.colItem}</th>
              <th className="px-4 py-3 font-medium">{t.admin.bookings.colDate}</th>
              <th className="px-4 py-3 font-medium">{t.admin.bookings.colContact}</th>
              <th className="px-4 py-3 font-medium">{t.admin.bookings.colStatus}</th>
              <th className="px-4 py-3 font-medium">{t.admin.bookings.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{b.clientName}</p>
                  {b.company && (
                    <p className="text-xs text-slate-500">{b.company}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p>
                    {b.package
                      ? localized(locale, b.package.name, b.package.nameEn)
                      : b.service
                        ? localized(locale, b.service.title, b.service.titleEn)
                        : "—"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {b.package
                      ? t.admin.bookings.typePackage
                      : t.admin.bookings.typeIndividual}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {formatDate(b.date, "MMM d, yyyy", locale)}
                  <br />
                  <span className="text-slate-500">{b.timeSlot}</span>
                </td>
                <td className="px-4 py-3">
                  <p>{b.clientEmail}</p>
                  <p className="text-slate-500">{b.clientPhone}</p>
                </td>
                <td className="px-4 py-3">
                  {t.statuses[b.status as keyof typeof t.statuses] ?? b.status}
                </td>
                <td className="px-4 py-3">
                  <BookingActions id={b.id} status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
