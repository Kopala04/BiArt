"use server";

import { z } from "zod";
import { db, withDbRetry, isSqliteStaleError } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { linkBookingsToUser } from "@/lib/consultation-credit";
import { getServerDictionary } from "@/lib/i18n/server";
import { ORDER_TIME_SLOT } from "@/lib/constants";
import { localized } from "@/lib/utils";

function isForeignKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "P2003" ||
    e.message?.includes("Foreign key constraint violated") === true
  );
}

const orderSchema = z
  .object({
    serviceId: z.string().optional(),
    printProductId: z.string().optional(),
    quantity: z.coerce.number().int().min(1).default(1),
    clientName: z.string().min(2),
    clientEmail: z.string().email(),
    clientPhone: z.string().min(5),
    company: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.serviceId || data.printProductId, {
    message: "Select a product or service.",
  });

export async function createOrder(formData: FormData) {
  const { t, locale } = await getServerDictionary();
  const parsed = orderSchema.safeParse({
    serviceId: formData.get("serviceId")?.toString() || undefined,
    printProductId: formData.get("printProductId")?.toString() || undefined,
    quantity: formData.get("quantity") ?? 1,
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientPhone: formData.get("clientPhone"),
    company: formData.get("company") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: t.order.errors.incompleteFields };
  }

  if (parsed.data.printProductId) {
    const product = await db.printProduct.findUnique({
      where: { id: parsed.data.printProductId, active: true },
      select: { maxQuantity: true },
    });
    if (!product) {
      return { error: t.order.errors.staleSelection };
    }
    if (parsed.data.quantity > product.maxQuantity) {
      return {
        error: t.order.errors.exceedsMax.replace(
          "{max}",
          String(product.maxQuantity)
        ),
      };
    }
  }

  const session = await getSession();
  const userByEmail = await db.user.findUnique({
    where: { email: parsed.data.clientEmail },
    select: { id: true },
  });
  const orderUserId = session?.user?.id ?? userByEmail?.id;

  try {
    return await withDbRetry(async (db) => {
      const [serviceExists, productExists] = await Promise.all([
        parsed.data.serviceId
          ? db.service.count({
              where: { id: parsed.data.serviceId, active: true, bookable: true },
            })
          : Promise.resolve(1),
        parsed.data.printProductId
          ? db.printProduct.count({
              where: { id: parsed.data.printProductId, active: true },
            })
          : Promise.resolve(1),
      ]);

      if (!serviceExists || !productExists) {
        return { error: t.order.errors.staleSelection };
      }

      const booking = await db.booking.create({
        data: {
          serviceId: parsed.data.serviceId,
          printProductId: parsed.data.printProductId,
          quantity: parsed.data.quantity,
          orderOnly: true,
          date: new Date(),
          timeSlot: ORDER_TIME_SLOT,
          schedulingSkipped: true,
          clientName: parsed.data.clientName,
          clientEmail: parsed.data.clientEmail,
          clientPhone: parsed.data.clientPhone,
          company: parsed.data.company,
          notes: parsed.data.notes,
          userId: orderUserId,
          status: "PENDING",
        },
        include: { service: true, printProduct: true },
      });

      if (orderUserId) {
        await linkBookingsToUser(orderUserId, parsed.data.clientEmail);
      }

      const itemName = booking.printProduct
        ? localized(
            locale,
            booking.printProduct.name,
            booking.printProduct.nameEn
          )
        : booking.service
          ? localized(locale, booking.service.title, booking.service.titleEn)
          : "Order";

      return {
        success: true as const,
        order: {
          id: booking.id,
          itemName,
          orderType: booking.printProductId ? "print" : "service",
          quantity: booking.quantity ?? 1,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
        },
      };
    });
  } catch (error) {
    if (isSqliteStaleError(error)) {
      return { error: t.order.errors.dbRefreshed };
    }
    if (isForeignKeyError(error)) {
      return { error: t.order.errors.staleSelection };
    }
    throw error;
  }
}
