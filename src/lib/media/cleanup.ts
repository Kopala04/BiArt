import { db } from "@/lib/db";
import { mediaConfig } from "./config";
import { mediaLogger } from "./logger";
import { deleteStoredObject } from "./upload-service";

export async function cleanupStaleIdempotencyRecords(): Promise<number> {
  const cutoff = new Date(
    Date.now() - mediaConfig.limits.idempotencyTtlHours * 60 * 60 * 1000
  );
  const result = await db.mediaUpload.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  if (result.count > 0) {
    mediaLogger.info("idempotency_cleanup", { removed: result.count });
  }
  return result.count;
}

/** Remove storage objects that are not referenced by any MediaItem. */
export async function cleanupOrphanedStorageObjects(): Promise<number> {
  const uploads = await db.mediaUpload.findMany({
    select: { storageKey: true, publicUrl: true },
  });

  const referenced = new Set<string>();
  const items = await db.mediaItem.findMany({
    select: { mediaStorageKey: true, thumbnailStorageKey: true, mediaUrl: true, thumbnailUrl: true },
  });

  for (const item of items) {
    if (item.mediaStorageKey) referenced.add(item.mediaStorageKey);
    if (item.thumbnailStorageKey) referenced.add(item.thumbnailStorageKey);
    if (item.mediaUrl) referenced.add(item.mediaUrl);
    if (item.thumbnailUrl) referenced.add(item.thumbnailUrl);
  }

  let removed = 0;
  for (const upload of uploads) {
    const isReferenced =
      referenced.has(upload.storageKey) || referenced.has(upload.publicUrl);
    if (isReferenced) continue;
    await deleteStoredObject(upload.publicUrl, upload.storageKey);
    await db.mediaUpload.deleteMany({ where: { storageKey: upload.storageKey } });
    removed += 1;
  }

  if (removed > 0) {
    mediaLogger.info("orphan_storage_cleanup", { removed });
  }
  return removed;
}
