import Link from "next/link";
import { signOut } from "@/lib/auth";
import { requireAuth } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { formatPrice, parseServices } from "@/lib/utils";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireAuth("B_USER");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      activePackage: true,
      bookings: {
        include: { package: true, service: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-slate-600">{user.company || "Business Client"}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <h2 className="font-semibold">Contact Information</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium">{user.phone || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Company</dt>
              <dd className="font-medium">{user.company || "Not provided"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold">Active Package</h2>
          {user.activePackage ? (
            <div className="mt-4">
              <p className="text-xl font-bold">{user.activePackage.name}</p>
              <p className="text-amber-600">{formatPrice(user.activePackage.price)}</p>
              <p className="mt-2 text-sm text-slate-600">
                {user.activePackage.description}
              </p>
              <ul className="mt-4 space-y-1 text-sm">
                {parseServices(user.activePackage.services).map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              No active package.{" "}
              <Link href="/packages" className="text-amber-600 hover:underline">
                Browse packages
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Booking History</h2>
          <Link href="/book">
            <Button size="sm">New Booking</Button>
          </Link>
        </div>
        {user.bookings.length === 0 ? (
          <p className="text-sm text-slate-600">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Booking</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {user.bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-50">
                    <td className="py-3 pr-4">
                      {booking.package?.name ?? booking.service?.title ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {format(booking.date, "MMM d, yyyy")}
                    </td>
                    <td className="py-3 pr-4">{booking.timeSlot}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-8"
      >
        <Button type="submit" variant="outline">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
