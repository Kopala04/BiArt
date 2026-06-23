import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getConsultationCredit } from "@/lib/consultation-credit";
import { CONSULTATION_SERVICE_SLUG } from "@/lib/constants";
import BookPageWrapper from "@/components/booking/BookingFlow";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";
import { localized } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerDictionary();
  return { title: t.booking.metaTitle };
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{
    upgrade?: string;
    from?: string;
    package?: string;
    service?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const locale = await getLocale();

  if (params.service && params.service !== CONSULTATION_SERVICE_SLUG) {
    redirect(`/order?service=${params.service}`);
  }
  if (params.type === "single") {
    redirect("/services");
  }

  const [dbPackages, consultationRow] = await Promise.all([
    db.package.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    params.service === CONSULTATION_SERVICE_SLUG
      ? db.service.findFirst({
          where: { slug: CONSULTATION_SERVICE_SLUG, active: true, bookable: true },
        })
      : Promise.resolve(null),
  ]);

  const packages = dbPackages.map((p) => ({
    id: p.id,
    name: localized(locale, p.name, p.nameEn),
    slug: p.slug,
    price: p.price,
    description: localized(locale, p.description, p.descriptionEn),
    services: localized(locale, p.services, p.servicesEn),
  }));

  const consultationService = consultationRow
    ? {
        id: consultationRow.id,
        title: localized(locale, consultationRow.title, consultationRow.titleEn),
        slug: consultationRow.slug,
        price: consultationRow.price,
        description: localized(
          locale,
          consultationRow.description,
          consultationRow.descriptionEn
        ),
      }
    : null;

  const credit = await getConsultationCredit({
    userId: session?.user?.id,
    email: session?.user?.email,
    explicitBookingId: params.from ?? null,
  });

  const consultationCredit = credit
    ? {
        id: credit.id,
        date: credit.date.toISOString(),
        timeSlot: credit.timeSlot,
        clientName: credit.clientName,
        clientEmail: credit.clientEmail,
        clientPhone: credit.clientPhone,
        company: credit.company,
      }
    : null;

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
    <BookPageWrapper
      packages={packages}
      consultationService={consultationService}
      consultationCredit={consultationCredit}
      upgradeMode={params.upgrade === "true" && !!consultationCredit}
      loggedInContact={loggedInContact}
    />
  );
}
