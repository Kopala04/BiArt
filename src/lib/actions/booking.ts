"use server";

import { z } from "zod";
import { db, withDbRetry, isSqliteStaleError } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireAdminAction } from "@/lib/admin-auth";
import {
  assignConsultationCreditOnComplete,
  getConsultationCredit,
  linkBookingsToUser,
} from "@/lib/consultation-credit";
import { getServerDictionary } from "@/lib/i18n/server";
import { CONSULTATION_CREDIT_TIME_SLOT } from "@/lib/constants";
import { slugify } from "@/lib/utils";

function isForeignKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "P2003" ||
    e.message?.includes("Foreign key constraint violated") === true
  );
}

const bookingSchema = z
  .object({
    packageId: z.string().optional(),
    serviceId: z.string().optional(),
    consultationBookingId: z.string().optional(),
    schedulingSkipped: z
      .string()
      .optional()
      .transform((v) => v === "true"),
    date: z.string().optional(),
    timeSlot: z.string().optional(),
    clientName: z.string().min(2),
    clientEmail: z.string().email(),
    clientPhone: z.string().min(5),
    company: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.packageId || data.serviceId, {
    message: "Select a package or service.",
  })
  .refine(
    (data) => data.schedulingSkipped || (data.date && data.timeSlot),
    { message: "Date and time are required." }
  );

export async function createBooking(formData: FormData) {
  const { t } = await getServerDictionary();
  const parsed = bookingSchema.safeParse({
    packageId: formData.get("packageId")?.toString() || undefined,
    serviceId: formData.get("serviceId")?.toString() || undefined,
    consultationBookingId:
      formData.get("consultationBookingId")?.toString() || undefined,
    schedulingSkipped: formData.get("schedulingSkipped")?.toString(),
    date: formData.get("date")?.toString() || undefined,
    timeSlot: formData.get("timeSlot")?.toString() || undefined,
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientPhone: formData.get("clientPhone"),
    company: formData.get("company") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: t.booking.errors.incompleteFields };
  }

  const session = await getSession();
  const userByEmail = await db.user.findUnique({
    where: { email: parsed.data.clientEmail },
    select: { id: true },
  });
  const bookingUserId = session?.user?.id ?? userByEmail?.id;

  let consultationBookingId: string | undefined =
    parsed.data.consultationBookingId;
  let schedulingSkipped = parsed.data.schedulingSkipped ?? false;
  let bookingDate: Date;
  let timeSlot: string;

  const applyStandardSchedule = (): boolean => {
    if (!parsed.data.date || !parsed.data.timeSlot) {
      return false;
    }
    bookingDate = new Date(parsed.data.date);
    timeSlot = parsed.data.timeSlot;
    consultationBookingId = undefined;
    schedulingSkipped = false;
    return true;
  };

  if (parsed.data.packageId && schedulingSkipped && !consultationBookingId) {
    return { error: t.booking.errors.creditRequiredToSkip };
  }

  if (parsed.data.packageId && consultationBookingId) {
    const credit = await getConsultationCredit({
      userId: bookingUserId,
      email: parsed.data.clientEmail,
      explicitBookingId: consultationBookingId,
    });
    if (credit) {
      consultationBookingId = credit.id;
      if (schedulingSkipped) {
        bookingDate = credit.date;
        timeSlot = CONSULTATION_CREDIT_TIME_SLOT;
      } else if (!parsed.data.date || !parsed.data.timeSlot) {
        return { error: t.booking.errors.chooseKickoff };
      } else {
        bookingDate = new Date(parsed.data.date);
        timeSlot = parsed.data.timeSlot;
      }
    } else if (schedulingSkipped) {
      return {
        error: t.booking.errors.creditUnavailableSkip,
      };
    } else {
      if (!applyStandardSchedule()) {
        return { error: t.booking.errors.incompleteFields };
      }
    }
  } else {
    if (!applyStandardSchedule()) {
      return { error: t.booking.errors.incompleteFields };
    }
  }

  try {
    return await withDbRetry(async (db) => {
      // Guard against stale form submissions (e.g. after the DB was reseeded):
      // verify the referenced rows still exist before relying on the FK.
      const [packageExists, serviceExists, creditExists] = await Promise.all([
        parsed.data.packageId
          ? db.package.count({ where: { id: parsed.data.packageId } })
          : Promise.resolve(1),
        parsed.data.serviceId
          ? db.service.count({ where: { id: parsed.data.serviceId } })
          : Promise.resolve(1),
        consultationBookingId
          ? db.booking.count({ where: { id: consultationBookingId } })
          : Promise.resolve(1),
      ]);

      if (!packageExists || !serviceExists || !creditExists) {
        return { error: t.booking.errors.staleSelection };
      }

      const booking = await db.booking.create({
        data: {
          packageId: parsed.data.packageId,
          serviceId: parsed.data.serviceId,
          consultationBookingId,
          schedulingSkipped,
          date: bookingDate,
          timeSlot,
          clientName: parsed.data.clientName,
          clientEmail: parsed.data.clientEmail,
          clientPhone: parsed.data.clientPhone,
          company: parsed.data.company,
          notes: parsed.data.notes,
          userId: bookingUserId,
          status: "PENDING",
        },
        include: { package: true, service: true },
      });

      if (bookingUserId && parsed.data.packageId && consultationBookingId) {
        const { consumeConsultationCredit } = await import(
          "@/lib/consultation-credit"
        );
        await consumeConsultationCredit(bookingUserId, parsed.data.packageId);
      } else if (bookingUserId) {
        await linkBookingsToUser(bookingUserId, parsed.data.clientEmail);
      }

      const itemName =
        booking.package?.name ?? booking.service?.title ?? "Booking";

      return {
        success: true as const,
        booking: {
          id: booking.id,
          itemName,
          bookingType: booking.packageId ? "package" : "service",
          date: booking.date.toISOString(),
          timeSlot: booking.timeSlot,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          schedulingSkipped: booking.schedulingSkipped,
          upgradedFromConsultation: !!consultationBookingId,
        },
      };
    });
  } catch (error) {
    if (isSqliteStaleError(error)) {
      return {
        error: t.booking.errors.dbRefreshed,
      };
    }
    if (isForeignKeyError(error)) {
      return { error: t.booking.errors.staleSelection };
    }
    throw error;
  }
}

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export async function submitContact(formData: FormData) {
  const { t } = await getServerDictionary();
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    company: formData.get("company") || undefined,
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: t.booking.contactErrors.invalid };
  }

  try {
    await db.contactMessage.create({ data: parsed.data });
    return { success: true };
  } catch {
    return { error: t.booking.contactErrors.invalid };
  }
}

export async function updateBookingStatus(id: string, status: string) {
  await requireAdminAction();
  const booking = await db.booking.update({
    where: { id },
    data: { status: status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" },
    include: { service: true },
  });

  if (status === "COMPLETED") {
    await assignConsultationCreditOnComplete(id);
  }

  if (status === "CANCELLED" && booking.service?.slug === "b2b-consultations") {
    await db.user.updateMany({
      where: { consultationBookingId: id },
      data: { consultationBookingId: null },
    });
  }

  return { success: true };
}

export async function deleteBooking(id: string) {
  await requireAdminAction();
  await db.booking.delete({ where: { id } });
  return { success: true };
}

function optionalText(formData: FormData, key: string): string | null {
  const value = (formData.get(key) as string | null)?.trim();
  return value ? value : null;
}

function optionalServicesJson(formData: FormData, key: string): string | null {
  const value = (formData.get(key) as string | null) ?? "";
  const items = value.split("\n").filter(Boolean);
  return items.length ? JSON.stringify(items) : null;
}

export async function createPackage(formData: FormData) {
  await requireAdminAction();
  const services = formData.get("services") as string;
  await db.package.create({
    data: {
      name: formData.get("name") as string,
      nameEn: optionalText(formData, "nameEn"),
      slug: (formData.get("slug") as string) || slugify(formData.get("name") as string),
      price: parseFloat(formData.get("price") as string),
      description: formData.get("description") as string,
      descriptionEn: optionalText(formData, "descriptionEn"),
      services: JSON.stringify(services.split("\n").filter(Boolean)),
      servicesEn: optionalServicesJson(formData, "servicesEn"),
      featured: formData.get("featured") === "on",
      active: formData.get("active") !== "off",
    },
  });
  return { success: true };
}

export async function updatePackage(id: string, formData: FormData) {
  await requireAdminAction();
  const services = formData.get("services") as string;
  await db.package.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      nameEn: optionalText(formData, "nameEn"),
      slug: formData.get("slug") as string,
      price: parseFloat(formData.get("price") as string),
      description: formData.get("description") as string,
      descriptionEn: optionalText(formData, "descriptionEn"),
      services: JSON.stringify(services.split("\n").filter(Boolean)),
      servicesEn: optionalServicesJson(formData, "servicesEn"),
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
    },
  });
  return { success: true };
}

export async function deletePackage(id: string) {
  await requireAdminAction();
  await db.package.delete({ where: { id } });
  return { success: true };
}

export async function createService(formData: FormData) {
  await requireAdminAction();
  await db.service.create({
    data: {
      title: formData.get("title") as string,
      titleEn: optionalText(formData, "titleEn"),
      slug: (formData.get("slug") as string) || slugify(formData.get("title") as string),
      description: formData.get("description") as string,
      descriptionEn: optionalText(formData, "descriptionEn"),
      icon: formData.get("icon") as string,
      price: formData.get("price")
        ? parseFloat(formData.get("price") as string)
        : null,
      bookable: formData.get("bookable") === "on",
      featured: formData.get("featured") === "on",
      active: formData.get("active") !== "off",
    },
  });
  return { success: true };
}

export async function updateService(id: string, formData: FormData) {
  await requireAdminAction();
  await db.service.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      titleEn: optionalText(formData, "titleEn"),
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      descriptionEn: optionalText(formData, "descriptionEn"),
      icon: formData.get("icon") as string,
      price: formData.get("price")
        ? parseFloat(formData.get("price") as string)
        : null,
      bookable: formData.get("bookable") === "on",
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
    },
  });
  return { success: true };
}

export async function deleteService(id: string) {
  await requireAdminAction();
  await db.service.delete({ where: { id } });
  return { success: true };
}

export async function createMediaItem(formData: FormData) {
  await requireAdminAction();
  await db.mediaItem.create({
    data: {
      title: formData.get("title") as string,
      titleEn: optionalText(formData, "titleEn"),
      description: formData.get("description") as string,
      descriptionEn: optionalText(formData, "descriptionEn"),
      category: formData.get("category") as "VIDEO" | "PHOTOGRAPHY" | "CAMPAIGNS" | "BRANDING" | "OTHER",
      mediaUrl: formData.get("mediaUrl") as string,
      thumbnailUrl: optionalText(formData, "thumbnailUrl"),
      tags: formData.get("tags") as string,
      tagsEn: optionalText(formData, "tagsEn"),
      featured: formData.get("featured") === "on",
      active: formData.get("active") !== "off",
    },
  });
  return { success: true };
}

export async function updateMediaItem(id: string, formData: FormData) {
  await requireAdminAction();
  await db.mediaItem.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      titleEn: optionalText(formData, "titleEn"),
      description: formData.get("description") as string,
      descriptionEn: optionalText(formData, "descriptionEn"),
      category: formData.get("category") as "VIDEO" | "PHOTOGRAPHY" | "CAMPAIGNS" | "BRANDING" | "OTHER",
      mediaUrl: formData.get("mediaUrl") as string,
      thumbnailUrl: optionalText(formData, "thumbnailUrl"),
      tags: formData.get("tags") as string,
      tagsEn: optionalText(formData, "tagsEn"),
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
    },
  });
  return { success: true };
}

export async function deleteMediaItem(id: string) {
  await requireAdminAction();
  await db.mediaItem.delete({ where: { id } });
  return { success: true };
}

export async function updateUserPackage(userId: string, packageId: string | null) {
  await requireAdminAction();
  await db.user.update({
    where: { id: userId },
    data: { activePackageId: packageId },
  });
  return { success: true };
}

export async function deleteUser(id: string) {
  await requireAdminAction();
  await db.user.delete({ where: { id } });
  return { success: true };
}

export async function markContactRead(id: string) {
  await requireAdminAction();
  await db.contactMessage.update({
    where: { id },
    data: { read: true },
  });
  return { success: true };
}
