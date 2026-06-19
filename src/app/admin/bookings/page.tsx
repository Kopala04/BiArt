import { format } from "date-fns";
import { db } from "@/lib/db";
import { BookingActions } from "@/components/admin/BookingActions";

export const metadata = { title: "Manage Bookings" };

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { package: true, service: true, user: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Bookings</h1>
      <p className="mt-1 text-slate-600">{bookings.length} total bookings</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
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
                  <p>{b.package?.name ?? b.service?.title ?? "—"}</p>
                  <p className="text-xs text-slate-500">
                    {b.package ? "Package" : "Individual"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {format(b.date, "MMM d, yyyy")}
                  <br />
                  <span className="text-slate-500">{b.timeSlot}</span>
                </td>
                <td className="px-4 py-3">
                  <p>{b.clientEmail}</p>
                  <p className="text-slate-500">{b.clientPhone}</p>
                </td>
                <td className="px-4 py-3">{b.status}</td>
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
