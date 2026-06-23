import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { getServerDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n";
import { formatPrice, localized } from "@/lib/utils";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.printCategory.findUnique({ where: { slug } });
  if (!category) return { title: "Print" };
  const { locale } = await getServerDictionary();
  return {
    title: localized(locale, category.name, category.nameEn),
  };
}

export default async function PrintCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale, t } = await getServerDictionary();

  const category = await db.printCategory.findUnique({
    where: { slug, active: true },
    include: {
      products: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!category) notFound();

  const name = localized(locale, category.name, category.nameEn);
  const description = localized(
    locale,
    category.description ?? "",
    category.descriptionEn
  );

  return (
    <PublicLayout>
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/print"
            className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden />
            {t.print.allCategories}
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">{name}</h1>
          {description && (
            <p className="mt-4 max-w-2xl text-lg text-slate-300">{description}</p>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {category.products.length === 0 ? (
            <p className="py-16 text-center text-slate-500">{t.print.noProducts}</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t.print.colProduct}</th>
                      <th className="px-6 py-4 font-semibold">{t.print.colDetails}</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        {t.print.colPrice}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.products.map((product) => {
                      const productName = localized(
                        locale,
                        product.name,
                        product.nameEn
                      );
                      const productDesc = localized(
                        locale,
                        product.description ?? "",
                        product.descriptionEn
                      );
                      const priceNote = localized(
                        locale,
                        product.priceNote ?? "",
                        product.priceNoteEn
                      );
                      const unit = localized(
                        locale,
                        product.unit ?? "",
                        product.unitEn
                      );

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">
                              {productName}
                            </p>
                            {product.minQuantity && (
                              <p className="mt-1 text-xs text-slate-500">
                                {fill(t.print.minQuantity, {
                                  count: String(product.minQuantity),
                                })}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {productDesc || "—"}
                            {unit && (
                              <span className="mt-1 block text-xs text-slate-400">
                                {fill(t.print.perUnit, { unit })}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-lg font-bold text-amber-600">
                              {formatPrice(product.price, locale)}
                            </p>
                            {priceNote && (
                              <p className="mt-0.5 text-xs text-slate-500">{priceNote}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">{t.print.quoteTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">{t.print.quoteSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact">
                <Button variant="secondary">{t.common.contactUs}</Button>
              </Link>
              <Link href="/book">
                <Button className="inline-flex items-center gap-1">
                  {t.common.bookNow}
                  <ChevronRight size={14} aria-hidden />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
