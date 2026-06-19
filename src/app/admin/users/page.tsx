import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { UserPackageSelect } from "@/components/admin/UserPackageSelect";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteUser } from "@/lib/actions/booking";

export const metadata = { title: "Manage B Users" };

export default async function AdminUsersPage() {
  const [users, packages] = await Promise.all([
    db.user.findMany({
      where: { role: "B_USER" },
      include: {
        activePackage: true,
        bookings: { include: { package: true, service: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.package.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">B Users</h1>
      <p className="mt-1 text-slate-600">{users.length} business clients</p>

      <div className="mt-8 space-y-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-sm text-slate-600">{user.email}</p>
                {user.company && (
                  <p className="text-sm text-slate-500">{user.company}</p>
                )}
              </div>
              <DeleteButton id={user.id} label="Delete User" onDelete={deleteUser} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Package</p>
                {user.activePackage ? (
                  <p className="mt-1">
                    {user.activePackage.name} —{" "}
                    {formatPrice(user.activePackage.price)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">None assigned</p>
                )}
                <UserPackageSelect
                  userId={user.id}
                  packages={packages}
                  currentPackageId={user.activePackageId}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Bookings ({user.bookings.length})
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {user.bookings.slice(0, 3).map((b) => (
                    <li key={b.id}>
                      {b.package?.name ?? b.service?.title ?? "Booking"} — {b.status}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
