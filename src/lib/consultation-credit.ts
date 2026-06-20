import { db } from "@/lib/db";
import { CONSULTATION_SERVICE_SLUG } from "@/lib/constants";

export type ConsultationCredit = {
  id: string;
  date: Date;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string | null;
};

async function getConsultationServiceId() {
  const service = await db.service.findUnique({
    where: { slug: CONSULTATION_SERVICE_SLUG },
    select: { id: true },
  });
  return service?.id ?? null;
}

export async function isConsultationCreditUsed(consultationBookingId: string) {
  const used = await db.booking.count({
    where: {
      consultationBookingId,
      packageId: { not: null },
    },
  });
  return used > 0;
}

function toCredit(booking: {
  id: string;
  date: Date;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string | null;
}): ConsultationCredit {
  return {
    id: booking.id,
    date: booking.date,
    timeSlot: booking.timeSlot,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone,
    company: booking.company,
  };
}

/** Attach orphan bookings to a user account by email. */
export async function linkBookingsToUser(userId: string, email: string) {
  await db.booking.updateMany({
    where: { clientEmail: email, userId: null },
    data: { userId },
  });
  await syncConsultationCreditForUser(userId, email);
}

/** Find completed, unused consultation credit for a user or email. */
export async function getConsultationCredit(params: {
  userId?: string | null;
  email?: string | null;
  explicitBookingId?: string | null;
}): Promise<ConsultationCredit | null> {
  const serviceId = await getConsultationServiceId();
  if (!serviceId) return null;

  const isValidCredit = async (bookingId: string) => {
    if (await isConsultationCreditUsed(bookingId)) return false;
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        serviceId,
        status: "COMPLETED",
      },
    });
    return booking ?? null;
  };

  if (params.explicitBookingId) {
    const booking = await isValidCredit(params.explicitBookingId);
    if (!booking) return null;
    if (
      params.email &&
      booking.clientEmail.toLowerCase() !== params.email.toLowerCase()
    ) {
      return null;
    }
    return toCredit(booking);
  }

  if (params.userId) {
    const user = await db.user.findUnique({
      where: { id: params.userId },
      include: { consultationBooking: true },
    });
    if (
      user?.consultationBookingId &&
      user.consultationBooking?.status === "COMPLETED" &&
      user.consultationBooking.serviceId === serviceId
    ) {
      if (!(await isConsultationCreditUsed(user.consultationBookingId))) {
        return toCredit(user.consultationBooking);
      }
    }
  }

  if (params.email) {
    const booking = await db.booking.findFirst({
      where: {
        clientEmail: params.email,
        serviceId,
        status: "COMPLETED",
      },
      orderBy: { date: "desc" },
    });
    if (booking && !(await isConsultationCreditUsed(booking.id))) {
      return toCredit(booking);
    }
  }

  return null;
}

/** Set user.consultationBookingId when a completed consultation is available. */
export async function syncConsultationCreditForUser(userId: string, email: string) {
  const credit = await getConsultationCredit({ userId, email });
  await db.user.update({
    where: { id: userId },
    data: { consultationBookingId: credit?.id ?? null },
  });
}

/** When admin marks a consultation complete, assign credit to matching user. */
export async function assignConsultationCreditOnComplete(bookingId: string) {
  const serviceId = await getConsultationServiceId();
  if (!serviceId) return;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });
  if (!booking?.serviceId || booking.serviceId !== serviceId) return;

  const user = await db.user.findUnique({
    where: { email: booking.clientEmail },
  });

  if (user) {
    if (!booking.userId) {
      await db.booking.update({
        where: { id: bookingId },
        data: { userId: user.id },
      });
    }
    if (!(await isConsultationCreditUsed(bookingId))) {
      await db.user.update({
        where: { id: user.id },
        data: { consultationBookingId: bookingId },
      });
    }
  }
}

/** Clear credit and activate package after a successful upgrade purchase. */
export async function consumeConsultationCredit(
  userId: string,
  packageId: string
) {
  await db.user.update({
    where: { id: userId },
    data: {
      activePackageId: packageId,
      consultationBookingId: null,
    },
  });
}
