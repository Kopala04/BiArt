"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdminAction } from "@/lib/admin-auth";
import { getServerDictionary } from "@/lib/i18n/server";
import {
  deleteStoredObject,
  isManagedMediaUrl,
} from "@/lib/media/upload-service";

function optionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key)?.toString().trim();
  return value ? value : null;
}

function revalidateMediaPaths() {
  revalidatePath("/admin/media");
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function createMediaItem(formData: FormData) {
  const { t } = await getServerDictionary();
  await requireAdminAction();

  const mediaUrl = formData.get("mediaUrl")?.toString().trim();
  if (!mediaUrl) {
    return { error: t.admin.forms.uploadErrors.mediaRequired };
  }

  await db.mediaItem.create({
    data: {
      title: formData.get("title") as string,
      titleEn: optionalText(formData, "titleEn"),
      description: (formData.get("description") as string) || "",
      descriptionEn: optionalText(formData, "descriptionEn"),
      category: formData.get("category") as
        | "VIDEO"
        | "PHOTOGRAPHY"
        | "CAMPAIGNS"
        | "BRANDING"
        | "OTHER",
      mediaUrl,
      mediaStorageKey: optionalText(formData, "mediaStorageKey"),
      thumbnailUrl: optionalText(formData, "thumbnailUrl"),
      thumbnailStorageKey: optionalText(formData, "thumbnailStorageKey"),
      tags: (formData.get("tags") as string) || "",
      tagsEn: optionalText(formData, "tagsEn"),
      featured: formData.get("featured") === "on",
      active: formData.get("active") !== "off",
    },
  });

  revalidateMediaPaths();
  return { success: true as const };
}

export async function updateMediaItem(id: string, formData: FormData) {
  const { t } = await getServerDictionary();
  await requireAdminAction();

  const existing = await db.mediaItem.findUnique({ where: { id } });
  if (!existing) {
    return { error: t.admin.forms.uploadErrors.staleItem };
  }

  const mediaUrl =
    formData.get("mediaUrl")?.toString().trim() || existing.mediaUrl;
  if (!mediaUrl) {
    return { error: t.admin.forms.uploadErrors.mediaRequired };
  }

  const mediaStorageKey =
    optionalText(formData, "mediaStorageKey") ?? existing.mediaStorageKey;
  const thumbnailUrl =
    optionalText(formData, "thumbnailUrl") ?? existing.thumbnailUrl;
  const thumbnailStorageKey =
    optionalText(formData, "thumbnailStorageKey") ?? existing.thumbnailStorageKey;

  if (
    existing.mediaUrl !== mediaUrl &&
    (existing.mediaStorageKey || isManagedMediaUrl(existing.mediaUrl))
  ) {
    await deleteStoredObject(existing.mediaUrl, existing.mediaStorageKey);
  }
  if (
    existing.thumbnailUrl &&
    existing.thumbnailUrl !== thumbnailUrl &&
    (existing.thumbnailStorageKey || isManagedMediaUrl(existing.thumbnailUrl))
  ) {
    await deleteStoredObject(existing.thumbnailUrl, existing.thumbnailStorageKey);
  }

  await db.mediaItem.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      titleEn: optionalText(formData, "titleEn"),
      description: (formData.get("description") as string) || "",
      descriptionEn: optionalText(formData, "descriptionEn"),
      category: formData.get("category") as
        | "VIDEO"
        | "PHOTOGRAPHY"
        | "CAMPAIGNS"
        | "BRANDING"
        | "OTHER",
      mediaUrl,
      mediaStorageKey,
      thumbnailUrl,
      thumbnailStorageKey,
      tags: (formData.get("tags") as string) || "",
      tagsEn: optionalText(formData, "tagsEn"),
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
    },
  });

  revalidateMediaPaths();
  return { success: true as const };
}

export async function deleteMediaItem(id: string) {
  await requireAdminAction();
  const existing = await db.mediaItem.findUnique({ where: { id } });
  if (existing) {
    if (existing.mediaStorageKey || isManagedMediaUrl(existing.mediaUrl)) {
      await deleteStoredObject(existing.mediaUrl, existing.mediaStorageKey);
    }
    if (
      existing.thumbnailUrl &&
      (existing.thumbnailStorageKey || isManagedMediaUrl(existing.thumbnailUrl))
    ) {
      await deleteStoredObject(existing.thumbnailUrl, existing.thumbnailStorageKey);
    }
  }
  await db.mediaItem.delete({ where: { id } });
  revalidateMediaPaths();
  return { success: true };
}
