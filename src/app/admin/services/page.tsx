import { db } from "@/lib/db";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteService } from "@/lib/actions/booking";

export const metadata = { title: "Manage Services" };

export default async function AdminServicesPage() {
  const services = await db.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Services</h1>
      <ServiceForm />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">{service.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{service.description}</p>
              </div>
              <DeleteButton id={service.id} label="Delete" onDelete={deleteService} />
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-amber-600">
                Edit
              </summary>
              <ServiceForm service={service} />
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
