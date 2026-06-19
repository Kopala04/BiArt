"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireAdminAction } from "@/lib/admin-auth";

const bookingSchema = z
  .object({
    packageId: z.string().optional(),
    serviceId: z.string().optional(),
    date: z.string(),
    timeSlot: z.string(),
    clientName: z.string().min(2),
    clientEmail: z.string().email(),
    clientPhone: z.string().min(5),
    company: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.packageId || data.serviceId, {
    message: "Select a package or service.",
  });

export async function createBooking(formData: FormData) {
  const parsed = bookingSchema.safeParse({
    packageId: formData.get("packageId") || undefined,
    serviceId: formData.get("serviceId") || undefined,
    date: formData.get("date"),
    timeSlot: formData.get("timeSlot"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientPhone: formData.get("clientPhone"),
    company: formData.get("company") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Please complete all required fields." };
  }

  const session = await auth();
  const bookingDate = new Date(parsed.data.date);

  const booking = await db.booking.create({
    data: {
      packageId: parsed.data.packageId,
      serviceId: parsed.data.serviceId,
      date: bookingDate,
      timeSlot: parsed.data.timeSlot,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      clientPhone: parsed.data.clientPhone,
      company: parsed.data.company,
      notes: parsed.data.notes,
      userId: session?.user?.id,
      status: "PENDING",
    },
    include: { package: true, service: true },
  });

  const itemName = booking.package?.name ?? booking.service?.title ?? "Booking";

  return {
    success: true,
    booking: {
      id: booking.id,
      itemName,
      bookingType: booking.packageId ? "package" : "service",
      date: booking.date.toISOString(),
      timeSlot: booking.timeSlot,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
    },
  };
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
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    company: formData.get("company") || undefined,
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: "Please fill in all required fields." };
  }

  await db.contactMessage.create({ data: parsed.data });
  return { success: true };
}

export async function updateBookingStatus(id: string, status: string) {
  await requireAdminAction();
  await db.booking.update({
    where: { id },
    data: { status: status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" },
  });
  return { success: true };
}

export async function deleteBooking(id: string) {
  await requireAdminAction();
  await db.booking.delete({ where: { id } });
  return { success: true };
}

export async function createPackage(formData: FormData) {
  await requireAdminAction();
  const services = formData.get("services") as string;
  await db.package.create({
    data: {
      name: formData.get("name") as string,
      slug: (formData.get("slug") as string) || (formData.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
      price: parseFloat(formData.get("price") as string),
      description: formData.get("description") as string,
      services: JSON.stringify(services.split("\n").filter(Boolean)),
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
      slug: formData.get("slug") as string,
      price: parseFloat(formData.get("price") as string),
      description: formData.get("description") as string,
      services: JSON.stringify(services.split("\n").filter(Boolean)),
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
      slug: (formData.get("slug") as string) || (formData.get("title") as string).toLowerCase().replace(/\s+/g, "-"),
      description: formData.get("description") as string,
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
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
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
      description: formData.get("description") as string,
      category: formData.get("category") as "VIDEO" | "PHOTOGRAPHY" | "CAMPAIGNS" | "BRANDING" | "OTHER",
      mediaUrl: formData.get("mediaUrl") as string,
      thumbnailUrl: formData.get("thumbnailUrl") as string,
      tags: formData.get("tags") as string,
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
      description: formData.get("description") as string,
      category: formData.get("category") as "VIDEO" | "PHOTOGRAPHY" | "CAMPAIGNS" | "BRANDING" | "OTHER",
      mediaUrl: formData.get("mediaUrl") as string,
      thumbnailUrl: formData.get("thumbnailUrl") as string,
      tags: formData.get("tags") as string,
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
