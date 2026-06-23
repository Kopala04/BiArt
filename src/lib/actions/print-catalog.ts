"use server";

import { db } from "@/lib/db";
import { requireAdminAction } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

function optionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key)?.toString().trim();
  return value ? value : null;
}

function optionalInt(formData: FormData, key: string): number | null {
  const raw = formData.get(key)?.toString().trim();
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export async function getPrintNavCategories() {
  return db.printCategory.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      nameEn: true,
    },
  });
}

export async function createPrintCategory(formData: FormData) {
  await requireAdminAction();
  await db.printCategory.create({
    data: {
      name: formData.get("name") as string,
      nameEn: optionalText(formData, "nameEn"),
      slug:
        (formData.get("slug") as string) ||
        slugify(formData.get("name") as string),
      description: optionalText(formData, "description"),
      descriptionEn: optionalText(formData, "descriptionEn"),
      icon: optionalText(formData, "icon"),
      active: formData.get("active") !== "off",
      sortOrder: optionalInt(formData, "sortOrder") ?? 0,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/print", "layout");
  return { success: true };
}

export async function updatePrintCategory(id: string, formData: FormData) {
  await requireAdminAction();
  await db.printCategory.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      nameEn: optionalText(formData, "nameEn"),
      slug: formData.get("slug") as string,
      description: optionalText(formData, "description"),
      descriptionEn: optionalText(formData, "descriptionEn"),
      icon: optionalText(formData, "icon"),
      active: formData.get("active") === "on",
      sortOrder: optionalInt(formData, "sortOrder") ?? 0,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/print", "layout");
  return { success: true };
}

export async function deletePrintCategory(id: string) {
  await requireAdminAction();
  await db.printCategory.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/print", "layout");
  return { success: true };
}

export async function createPrintProduct(formData: FormData) {
  await requireAdminAction();
  const categoryId = formData.get("categoryId") as string;
  await db.printProduct.create({
    data: {
      categoryId,
      name: formData.get("name") as string,
      nameEn: optionalText(formData, "nameEn"),
      slug:
        (formData.get("slug") as string) ||
        slugify(formData.get("name") as string),
      description: optionalText(formData, "description"),
      descriptionEn: optionalText(formData, "descriptionEn"),
      price: parseFloat(formData.get("price") as string),
      priceNote: optionalText(formData, "priceNote"),
      priceNoteEn: optionalText(formData, "priceNoteEn"),
      minQuantity: null,
      maxQuantity: optionalInt(formData, "maxQuantity") ?? 5,
      unit: optionalText(formData, "unit"),
      unitEn: optionalText(formData, "unitEn"),
      imageUrl: optionalText(formData, "imageUrl"),
      active: formData.get("active") !== "off",
      sortOrder: optionalInt(formData, "sortOrder") ?? 0,
    },
  });
  revalidatePath("/print", "layout");
  return { success: true };
}

export async function updatePrintProduct(id: string, formData: FormData) {
  await requireAdminAction();
  await db.printProduct.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      nameEn: optionalText(formData, "nameEn"),
      slug: formData.get("slug") as string,
      description: optionalText(formData, "description"),
      descriptionEn: optionalText(formData, "descriptionEn"),
      price: parseFloat(formData.get("price") as string),
      priceNote: optionalText(formData, "priceNote"),
      priceNoteEn: optionalText(formData, "priceNoteEn"),
      minQuantity: null,
      maxQuantity: optionalInt(formData, "maxQuantity") ?? 5,
      unit: optionalText(formData, "unit"),
      unitEn: optionalText(formData, "unitEn"),
      imageUrl: optionalText(formData, "imageUrl"),
      active: formData.get("active") === "on",
      sortOrder: optionalInt(formData, "sortOrder") ?? 0,
    },
  });
  revalidatePath("/print", "layout");
  return { success: true };
}

export async function deletePrintProduct(id: string) {
  await requireAdminAction();
  await db.printProduct.delete({ where: { id } });
  revalidatePath("/print", "layout");
  return { success: true };
}
