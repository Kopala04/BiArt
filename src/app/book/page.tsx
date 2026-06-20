import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getConsultationCredit } from "@/lib/consultation-credit";
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
  searchParams: Promise<{ upgrade?: string; from?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const locale = await getLocale();

  const [dbPackages, dbServices] = await Promise.all([
    db.package.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.service.findMany({
      where: { active: true, bookable: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const packages = dbPackages.map((p) => ({
    id: p.id,
    name: localized(locale, p.name, p.nameEn),
    slug: p.slug,
    price: p.price,
    description: localized(locale, p.description, p.descriptionEn),
    services: localized(locale, p.services, p.servicesEn),
  }));

  const services = dbServices.map((s) => ({
    id: s.id,
    title: localized(locale, s.title, s.titleEn),
    slug: s.slug,
    price: s.price,
    description: localized(locale, s.description, s.descriptionEn),
  }));

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
      services={services}
      consultationCredit={consultationCredit}
      upgradeMode={params.upgrade === "true" && !!consultationCredit}
      loggedInContact={loggedInContact}
    />
  );
}
