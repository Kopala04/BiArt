import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { formatPrice, parseServices, localized } from "@/lib/utils";
import { getServerDictionary } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.packages.title };
}

export default async function PackagesPage() {
  const { locale, t } = await getServerDictionary();
  const packages = await db.package.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <PublicLayout>
      <section className="page-hero py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">{t.packages.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            {t.packages.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  pkg.featured ? "package-featured" : "border-slate-200 bg-white"
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white">
                    {t.common.mostPopular}
                  </span>
                )}
                <h2 className="text-2xl font-bold">
                  {localized(locale, pkg.name, pkg.nameEn)}
                </h2>
                <p className={`mt-2 text-4xl font-bold ${pkg.featured ? "text-amber-400" : "text-slate-900"}`}>
                  {formatPrice(pkg.price, locale)}
                </p>
                <p className={`mt-4 text-sm ${pkg.featured ? "text-slate-300" : "text-slate-600"}`}>
                  {localized(locale, pkg.description, pkg.descriptionEn)}
                </p>
                <ul className="mt-8 flex-1 space-y-3">
                  {parseServices(localized(locale, pkg.services, pkg.servicesEn)).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle
                        size={16}
                        className={`mt-0.5 shrink-0 ${pkg.featured ? "text-amber-400" : "text-amber-500"}`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/book?package=${pkg.slug}`} className="mt-8">
                  <Button className="w-full" variant={pkg.featured ? "primary" : "secondary"}>
                    {t.packages.book} {localized(locale, pkg.name, pkg.nameEn)}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
