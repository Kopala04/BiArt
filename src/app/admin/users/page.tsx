import { db } from "@/lib/db";
import { formatPrice, localized } from "@/lib/utils";
import { UserPackageSelect } from "@/components/admin/UserPackageSelect";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteUser } from "@/lib/actions/booking";
import { getServerDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n";

export const metadata = { title: "Manage B Users" };

export default async function AdminUsersPage() {
  const { locale, t } = await getServerDictionary();
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
      <h1 className="text-2xl font-bold">{t.admin.users.title}</h1>
      <p className="mt-1 text-slate-600">
        {fill(t.admin.users.count, { count: users.length })}
      </p>

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
              <DeleteButton id={user.id} label={t.admin.users.deleteUser} onDelete={deleteUser} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-500">{t.admin.users.activePackage}</p>
                {user.activePackage ? (
                  <p className="mt-1">
                    {localized(locale, user.activePackage.name, user.activePackage.nameEn)} —{" "}
                    {formatPrice(user.activePackage.price)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">{t.admin.users.noneAssigned}</p>
                )}
                <UserPackageSelect
                  userId={user.id}
                  packages={packages}
                  currentPackageId={user.activePackageId}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {fill(t.admin.users.bookings, { count: user.bookings.length })}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {user.bookings.slice(0, 3).map((b) => (
                    <li key={b.id}>
                      {b.package
                        ? localized(locale, b.package.name, b.package.nameEn)
                        : b.service
                          ? localized(locale, b.service.title, b.service.titleEn)
                          : t.admin.users.booking}{" "}
                      —{" "}
                      {t.statuses[b.status as keyof typeof t.statuses] ?? b.status}
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
