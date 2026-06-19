import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getConsultationCredit } from "@/lib/consultation-credit";
import BookPageWrapper from "@/components/booking/BookingFlow";

export const metadata = { title: "Book Appointment" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; from?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();

  const [packages, services] = await Promise.all([
    db.package.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.service.findMany({
      where: { active: true, bookable: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

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

  const loggedInContact = session?.user?.email
    ? {
        clientName: session.user.name ?? "",
        clientEmail: session.user.email,
        clientPhone: "",
        company: "",
      }
    : null;

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
