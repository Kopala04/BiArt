import { db } from "@/lib/db";
import BookPageWrapper from "@/components/booking/BookingFlow";

export const metadata = { title: "Book Appointment" };

export default async function BookPage() {
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

  return <BookPageWrapper packages={packages} services={services} />;
}
