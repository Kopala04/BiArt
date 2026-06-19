import { db } from "@/lib/db";
import BookPageWrapper from "@/components/booking/BookingFlow";

export const metadata = { title: "Book Appointment" };

export default async function BookPage() {
  const packages = await db.package.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return <BookPageWrapper packages={packages} />;
}
