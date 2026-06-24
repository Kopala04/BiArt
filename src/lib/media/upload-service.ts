import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { mediaConfig } from "./config";
import { MediaUploadError } from "./errors";
import { mediaLogger } from "./logger";
import { mediaMetrics } from "./metrics";
import { getMediaStorageProvider } from "./storage";
import { putVercelBlobObject } from "./storage/vercel-blob";
import type {
  MediaUploadKind,
  StoredObject,
  UploadBatchResult,
  UploadFileInput,
} from "./types";
import {
  extensionForMime,
  readFileHeader,
  sanitizeOriginalFilename,
  validateUploadFile,
} from "./validation";

const inFlight = new Map<string, Promise<StoredObject>>();

function folderForKind(kind: MediaUploadKind): string {
  return kind === "thumbnail" ? "thumbnails" : "media";
}

function buildStorageKey(kind: MediaUploadKind, mimeType: string): string {
  const ext = extensionForMime(mimeType);
  return `${folderForKind(kind)}/${randomUUID()}${ext}`;
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  const timeoutMs = mediaConfig.limits.uploadTimeoutMs;
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new MediaUploadError("timeout")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function findIdempotentUpload(
  idempotencyKey: string
): Promise<StoredObject | null> {
  const row = await db.mediaUpload.findUnique({ where: { id: idempotencyKey } });
  if (!row) return null;
  return {
    storageKey: row.storageKey,
    publicUrl: row.publicUrl,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
  };
}

async function persistIdempotentUpload(
  idempotencyKey: string,
  stored: StoredObject
): Promise<void> {
  await db.mediaUpload.upsert({
    where: { id: idempotencyKey },
    create: {
      id: idempotencyKey,
      storageKey: stored.storageKey,
      publicUrl: stored.publicUrl,
      mimeType: stored.mimeType,
      byteSize: stored.byteSize,
    },
    update: {
      storageKey: stored.storageKey,
      publicUrl: stored.publicUrl,
      mimeType: stored.mimeType,
      byteSize: stored.byteSize,
    },
  });
}

async function storeFile(
  file: File,
  kind: MediaUploadKind,
  idempotencyKey?: string
): Promise<StoredObject> {
  const started = Date.now();
  mediaMetrics.recordStart();

  if (idempotencyKey) {
    const existing = await findIdempotentUpload(idempotencyKey);
    if (existing) {
      mediaLogger.info("upload_idempotent_hit", {
        idempotencyKey,
        storageKey: existing.storageKey,
      });
      return existing;
    }

    const inflight = inFlight.get(idempotencyKey);
    if (inflight) {
      return inflight;
    }
  }

  const task = withTimeout((async () => {
    const header = await readFileHeader(file);
    const { mimeType, byteSize } = validateUploadFile(file, kind, header);
    const storageKey = buildStorageKey(kind, mimeType);
    const provider = getMediaStorageProvider();
    const originalName = sanitizeOriginalFilename(file.name);

    mediaLogger.info("upload_started", {
      kind,
      mimeType,
      byteSize,
      originalName,
      provider: provider.name,
      storageKey,
    });

    try {
      if (provider.name === "vercel-blob") {
        const publicUrl = await putVercelBlobObject({
          key: storageKey,
          body: file,
          contentType: mimeType,
          contentLength: byteSize,
        });
        const stored: StoredObject = {
          storageKey,
          publicUrl,
          mimeType,
          byteSize,
        };
        if (idempotencyKey) await persistIdempotentUpload(idempotencyKey, stored);
        mediaMetrics.recordSuccess(byteSize, Date.now() - started);
        mediaLogger.info("upload_succeeded", {
          storageKey,
          byteSize,
          durationMs: Date.now() - started,
        });
        return stored;
      }

      await provider.putObject({
        key: storageKey,
        body: file.stream(),
        contentType: mimeType,
        contentLength: byteSize,
      });

      const stored: StoredObject = {
        storageKey,
        publicUrl: provider.getPublicUrl(storageKey),
        mimeType,
        byteSize,
      };

      if (idempotencyKey) await persistIdempotentUpload(idempotencyKey, stored);
      mediaMetrics.recordSuccess(byteSize, Date.now() - started);
      mediaLogger.info("upload_succeeded", {
        storageKey,
        byteSize,
        durationMs: Date.now() - started,
      });
      return stored;
    } catch (error) {
      mediaMetrics.recordFailure(Date.now() - started);
      mediaLogger.error("upload_failed", {
        storageKey,
        durationMs: Date.now() - started,
        error: error instanceof Error ? error.name : "unknown",
      });
      if (error instanceof MediaUploadError) throw error;
      throw new MediaUploadError("failed");
    } finally {
      if (idempotencyKey) inFlight.delete(idempotencyKey);
    }
  })());

  if (idempotencyKey) inFlight.set(idempotencyKey, task);
  return task;
}

export async function uploadMediaFiles(
  inputs: UploadFileInput[]
): Promise<UploadBatchResult> {
  const result: UploadBatchResult = {};

  for (const input of inputs) {
    const stored = await storeFile(input.file, input.kind, input.idempotencyKey);
    if (input.kind === "thumbnail") {
      result.thumbnail = stored;
    } else {
      result.media = stored;
    }
  }

  if (!result.media && !result.thumbnail) {
    throw new MediaUploadError("mediaRequired");
  }

  return result;
}

export async function deleteStoredObject(
  publicUrl: string,
  storageKey?: string | null
): Promise<void> {
  const provider = getMediaStorageProvider();
  const key =
    storageKey ??
    provider.keyFromPublicUrl(publicUrl) ??
    (provider.isManagedUrl(publicUrl) ? publicUrl : null);

  if (!key) return;

  try {
    await provider.deleteObject(
      provider.name === "vercel-blob" ? publicUrl : key
    );
    mediaLogger.info("storage_deleted", { key, provider: provider.name });
  } catch {
    mediaLogger.warn("storage_delete_failed", { key, provider: provider.name });
  }
}

export function isManagedMediaUrl(url: string): boolean {
  return getMediaStorageProvider().isManagedUrl(url.trim());
}

export function resetUploadInFlightForTests() {
  inFlight.clear();
}
