import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CONSULTATION_SERVICE_SLUG } from "@/lib/constants";
import OrderPageWrapper from "@/components/order/OrderFlow";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";
import { localized } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.order.metaTitle };
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; product?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const session = await getSession();

  if (params.service === CONSULTATION_SERVICE_SLUG) {
    redirect(`/book?service=${CONSULTATION_SERVICE_SLUG}`);
  }

  const [dbServices, dbProducts] = await Promise.all([
    db.service.findMany({
      where: {
        active: true,
        bookable: true,
        slug: { not: CONSULTATION_SERVICE_SLUG },
      },
      orderBy: { sortOrder: "asc" },
    }),
    db.printProduct.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { category: true },
    }),
  ]);

  const services = dbServices.map((s) => ({
    id: s.id,
    title: localized(locale, s.title, s.titleEn),
    slug: s.slug,
    price: s.price,
    description: localized(locale, s.description, s.descriptionEn),
  }));

  const printProducts = dbProducts.map((p) => ({
    id: p.id,
    name: localized(locale, p.name, p.nameEn),
    slug: p.slug,
    price: p.price,
    description: localized(locale, p.description ?? "", p.descriptionEn),
    maxQuantity: p.maxQuantity,
    unit: localized(locale, p.unit ?? "", p.unitEn),
    categorySlug: p.category.slug,
    categoryName: localized(locale, p.category.name, p.category.nameEn),
  }));

  let loggedInContact = null;
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, company: true },
    });
    if (user) {
      loggedInContact = {
        clientName: user.name,
        clientEmail: user.email,
        clientPhone: user.phone ?? "",
        company: user.company ?? "",
      };
    }
  }

  return (
    <OrderPageWrapper
      services={services}
      printProducts={printProducts}
      loggedInContact={loggedInContact}
    />
  );
}
