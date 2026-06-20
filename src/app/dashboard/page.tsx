import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { formatPrice, parseServices, formatDate, localized, formatTimeSlot } from "@/lib/utils";
import { db } from "@/lib/db";
import { getServerDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.dashboard.overview };
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const { locale, t } = await getServerDictionary();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      activePackage: true,
      consultationBooking: { include: { service: true } },
      bookings: {
        include: { package: true, service: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {fill(t.dashboard.welcome, { name: user.name })}
        </h1>
        <p className="text-slate-600">
          {user.company || t.dashboard.businessClient}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <h2 className="font-semibold">{t.dashboard.contactInfo}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">{t.dashboard.email}</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t.dashboard.phone}</dt>
              <dd className="font-medium">{user.phone || t.dashboard.notProvided}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t.dashboard.company}</dt>
              <dd className="font-medium">{user.company || t.dashboard.notProvided}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold">{t.dashboard.activePackage}</h2>
          {user.consultationBooking && !user.activePackage && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                {t.dashboard.consultationDone}
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {fill(t.dashboard.consultationDoneSub, {
                  date: formatDate(
                    user.consultationBooking.date,
                    "MMMM d, yyyy",
                    locale
                  ),
                })}
              </p>
              <Link href="/book?type=packs&upgrade=true" className="mt-3 inline-block">
                <Button size="sm">{t.dashboard.upgradeToPackage}</Button>
              </Link>
            </div>
          )}
          {user.activePackage ? (
            <div className="mt-4">
              <p className="text-xl font-bold">
                {localized(locale, user.activePackage.name, user.activePackage.nameEn)}
              </p>
              <p className="text-amber-600">{formatPrice(user.activePackage.price, locale)}</p>
              <p className="mt-2 text-sm text-slate-600">
                {localized(
                  locale,
                  user.activePackage.description,
                  user.activePackage.descriptionEn
                )}
              </p>
              <ul className="mt-4 space-y-1 text-sm">
                {parseServices(
                  localized(
                    locale,
                    user.activePackage.services,
                    user.activePackage.servicesEn
                  )
                ).map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              {t.dashboard.noActivePackage}{" "}
              <Link href="/packages" className="text-amber-600 hover:underline">
                {t.dashboard.browsePackages}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t.dashboard.bookingHistory}</h2>
          <Link href="/book">
            <Button size="sm">{t.dashboard.newBooking}</Button>
          </Link>
        </div>
        {user.bookings.length === 0 ? (
          <p className="text-sm text-slate-600">{t.dashboard.noBookings}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">{t.dashboard.colBooking}</th>
                  <th className="pb-3 pr-4 font-medium">{t.dashboard.colDate}</th>
                  <th className="pb-3 pr-4 font-medium">{t.dashboard.colTime}</th>
                  <th className="pb-3 font-medium">{t.dashboard.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {user.bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-50">
                    <td className="py-3 pr-4">
                      {booking.package
                        ? localized(locale, booking.package.name, booking.package.nameEn)
                        : booking.service
                          ? localized(locale, booking.service.title, booking.service.titleEn)
                          : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {formatDate(booking.date, "MMM d, yyyy", locale)}
                    </td>
                    <td className="py-3 pr-4">
                      {formatTimeSlot(booking.timeSlot, t.booking.creditApplied)}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                        {t.statuses[
                          booking.status as keyof typeof t.statuses
                        ] ?? booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
