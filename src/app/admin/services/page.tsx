import { db } from "@/lib/db";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteService } from "@/lib/actions/booking";
import { getServerDictionary } from "@/lib/i18n/server";
import { localized } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.admin.services.title };
}

export default async function AdminServicesPage() {
  const { locale, t } = await getServerDictionary();
  const services = await db.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.admin.services.title}</h1>
      <ServiceForm />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">
                  {localized(locale, service.title, service.titleEn)}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {localized(locale, service.description, service.descriptionEn)}
                </p>
              </div>
              <DeleteButton id={service.id} label={t.admin.services.delete} onDelete={deleteService} />
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-amber-600">
                {t.admin.services.edit}
              </summary>
              <ServiceForm service={service} />
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
