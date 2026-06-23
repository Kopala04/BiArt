import Link from "next/link";
import { db } from "@/lib/db";
import { PrintCategoryForm } from "@/components/admin/PrintCategoryForm";
import { PrintProductForm } from "@/components/admin/PrintProductForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  deletePrintCategory,
  deletePrintProduct,
} from "@/lib/actions/print-catalog";
import { getServerDictionary } from "@/lib/i18n/server";
import { formatPrice, localized } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.admin.print.title };
}

export default async function AdminPrintPage() {
  const { locale, t } = await getServerDictionary();
  const categories = await db.printCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      products: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.admin.print.title}</h1>
      <p className="mt-1 text-slate-600">{t.admin.print.subtitle}</p>

      <PrintCategoryForm />

      <div className="mt-10 space-y-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {localized(locale, category.name, category.nameEn)}
                </h2>
                <p className="text-sm text-slate-500">/{category.slug}</p>
                {!category.active && (
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {t.admin.print.inactive}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/print/${category.slug}`}
                  className="text-sm font-medium text-amber-600 hover:underline"
                  target="_blank"
                >
                  {t.admin.print.viewPublic}
                </Link>
                <DeleteButton
                  id={category.id}
                  label={t.admin.print.deleteCategory}
                  onDelete={deletePrintCategory}
                />
              </div>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-amber-600">
                {t.admin.print.editCategory}
              </summary>
              <PrintCategoryForm category={category} />
            </details>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {t.admin.print.productsHeading}
              </h3>
              {category.products.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  {t.admin.print.noProducts}
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
                  {category.products.map((product) => (
                    <li key={product.id} className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {localized(locale, product.name, product.nameEn)}
                          </p>
                          <p className="text-sm text-amber-600">
                            {formatPrice(product.price, locale)}
                          </p>
                        </div>
                        <DeleteButton
                          id={product.id}
                          label={t.admin.print.deleteProduct}
                          onDelete={deletePrintProduct}
                        />
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-slate-500">
                          {t.admin.print.editProduct}
                        </summary>
                        <PrintProductForm
                          categoryId={category.id}
                          product={product}
                        />
                      </details>
                    </li>
                  ))}
                </ul>
              )}
              <PrintProductForm categoryId={category.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
