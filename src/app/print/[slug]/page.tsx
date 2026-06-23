import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { RemoteImage } from "@/components/ui/RemoteImage";
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
      <section className="page-hero py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/print"
            className="interactive-scale inline-flex items-center gap-1 text-sm text-slate-400 transition-all duration-300 hover:text-white"
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  <article
                    key={product.id}
                    className="interactive-card group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <RemoteImage
                        src={product.imageUrl ?? ""}
                        alt={productName}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {productName}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {fill(t.print.maxPerOrder, {
                          count: String(product.maxQuantity),
                        })}
                      </p>
                      {productDesc && (
                        <p className="mt-2 text-sm text-slate-600">{productDesc}</p>
                      )}
                      {unit && (
                        <p className="mt-1 text-xs text-slate-400">
                          {fill(t.print.perUnit, { unit })}
                        </p>
                      )}
                      <p className="mt-4 text-2xl font-bold text-amber-600">
                        {formatPrice(product.price, locale)}
                      </p>
                      {priceNote && (
                        <p className="mt-0.5 text-xs text-slate-500">{priceNote}</p>
                      )}
                      <div className="mt-5 pt-2">
                        <Link href={`/order?product=${product.slug}`}>
                          <Button size="sm" className="w-full">
                            {t.print.orderNow}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="interactive-lift mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">{t.print.needMoreTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">{t.print.needMoreSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/packages">
                <Button className="inline-flex items-center gap-1">
                  {t.common.bookPackage}
                  <ChevronRight size={14} aria-hidden />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary">{t.common.contactUs}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
