import { db } from "@/lib/db";
import { formatPrice, parseServices } from "@/lib/utils";
import { PackageForm } from "@/components/admin/PackageForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePackage } from "@/lib/actions/booking";

export const metadata = { title: "Manage Packages" };

export default async function AdminPackagesPage() {
  const packages = await db.package.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Packages</h1>
      <PackageForm />
      <div className="mt-10 space-y-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{pkg.name}</h2>
                <p className="text-amber-600">{formatPrice(pkg.price)}</p>
                <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {parseServices(pkg.services).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
              <DeleteButton
                id={pkg.id}
                label="Delete"
                onDelete={deletePackage}
              />
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-amber-600">
                Edit package
              </summary>
              <PackageForm pkg={pkg} />
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
