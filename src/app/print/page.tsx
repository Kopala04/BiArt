import Link from "next/link";
import { Shirt, Glasses, Package, Coffee, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { getServerDictionary } from "@/lib/i18n/server";
import { formatPrice, localized } from "@/lib/utils";
import type { Metadata } from "next";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shirt,
  Glasses,
  Package,
  Coffee,
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.print.title };
}

export default async function PrintIndexPage() {
  const { locale, t } = await getServerDictionary();
  const categories = await db.printCategory.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      _count: { select: { products: { where: { active: true } } } },
    },
  });

  return (
    <PublicLayout>
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">{t.print.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{t.print.subtitle}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {categories.length === 0 ? (
            <p className="py-20 text-center text-slate-500">{t.print.noCategories}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const Icon = iconMap[cat.icon ?? ""] ?? Package;
                const fromPrice = cat.products[0]?.price;
                return (
                  <Link
                    key={cat.id}
                    href={`/print/${cat.slug}`}
                    className="interactive-card group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-amber-400"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400 transition group-hover:bg-amber-500 group-hover:text-slate-950">
                      <Icon size={24} aria-hidden />
                    </div>
                    <h2 className="text-lg font-semibold">
                      {localized(locale, cat.name, cat.nameEn)}
                    </h2>
                    {cat.description && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {localized(locale, cat.description, cat.descriptionEn)}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {t.print.itemCount.replace(
                          "{count}",
                          String(cat._count.products)
                        )}
                      </span>
                      {fromPrice !== undefined && (
                        <span className="font-semibold text-amber-600">
                          {t.print.fromPrice.replace(
                            "{price}",
                            formatPrice(fromPrice, locale)
                          )}
                        </span>
                      )}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                      {t.print.viewPrices}
                      <ChevronRight size={14} aria-hidden />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-semibold">{t.print.ctaTitle}</h2>
            <p className="mt-2 text-slate-600">{t.print.ctaSubtitle}</p>
            <Link href="/contact" className="mt-6 inline-block">
              <Button>{t.common.contactUs}</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
