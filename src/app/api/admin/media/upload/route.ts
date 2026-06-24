import { randomUUID } from "node:crypto";
import { requireAdminAction } from "@/lib/admin-auth";
import { getServerDictionary } from "@/lib/i18n/server";
import {
  cleanupOrphanedStorageObjects,
  cleanupStaleIdempotencyRecords,
} from "@/lib/media/cleanup";
import { MediaUploadError } from "@/lib/media/errors";
import { mediaLogger } from "@/lib/media/logger";
import { mediaMetrics } from "@/lib/media/metrics";
import { checkUploadRateLimit } from "@/lib/media/rate-limit";
import { uploadMediaFiles } from "@/lib/media/upload-service";

export const runtime = "nodejs";

function jsonError(message: string, status: number, code?: string) {
  return Response.json({ error: message, code: code ?? "failed" }, { status });
}

function statusForUploadError(code: string): number {
  switch (code) {
    case "rateLimited":
      return 429;
    case "storageUnavailable":
      return 503;
    case "timeout":
      return 408;
    case "unauthorized":
      return 401;
    default:
      return 400;
  }
}

export async function POST(request: Request) {
  const started = Date.now();

  try {
    const session = await requireAdminAction();
    const { t } = await getServerDictionary();

    if (!checkUploadRateLimit(session.user.id)) {
      mediaLogger.warn("upload_rate_limited", { userId: session.user.id });
      return jsonError(
        t.admin.forms.uploadErrors.rateLimited,
        429,
        "rateLimited"
      );
    }

    const formData = await request.formData();
    const inputs = [];

    const mediaFile = formData.get("mediaFile");
    if (mediaFile instanceof File && mediaFile.size > 0) {
      inputs.push({
        file: mediaFile,
        kind: "media" as const,
        idempotencyKey:
          formData.get("mediaIdempotencyKey")?.toString() || randomUUID(),
      });
    }

    const thumbFile = formData.get("thumbnailFile");
    if (thumbFile instanceof File && thumbFile.size > 0) {
      inputs.push({
        file: thumbFile,
        kind: "thumbnail" as const,
        idempotencyKey:
          formData.get("thumbnailIdempotencyKey")?.toString() || randomUUID(),
      });
    }

    if (inputs.length === 0) {
      return jsonError(
        t.admin.forms.uploadErrors.mediaRequired,
        400,
        "mediaRequired"
      );
    }

    const result = await uploadMediaFiles(inputs);

    const snapshot = mediaMetrics.snapshot();
    mediaLogger.info("upload_batch_complete", {
      userId: session.user.id,
      durationMs: Date.now() - started,
      uploadsSucceeded: snapshot.uploadsSucceeded,
      uploadsFailed: snapshot.uploadsFailed,
      bytesStored: snapshot.bytesStored,
    });

    return Response.json({
      media: result.media
        ? {
            mediaUrl: result.media.publicUrl,
            mediaStorageKey: result.media.storageKey,
            mimeType: result.media.mimeType,
            byteSize: result.media.byteSize,
          }
        : undefined,
      thumbnail: result.thumbnail
        ? {
            thumbnailUrl: result.thumbnail.publicUrl,
            thumbnailStorageKey: result.thumbnail.storageKey,
            mimeType: result.thumbnail.mimeType,
            byteSize: result.thumbnail.byteSize,
          }
        : undefined,
    });
  } catch (error) {
    const { t } = await getServerDictionary();
    if (error instanceof MediaUploadError) {
      const key = error.code as keyof typeof t.admin.forms.uploadErrors;
      return jsonError(
        t.admin.forms.uploadErrors[key] ?? t.admin.forms.uploadErrors.failed,
        statusForUploadError(error.code),
        error.code
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError(t.admin.forms.uploadErrors.unauthorized, 401, "unauthorized");
    }
    if (error instanceof Error && error.message === "MEDIA_STORAGE_UNAVAILABLE") {
      return jsonError(
        t.admin.forms.uploadErrors.storageUnavailable,
        503,
        "storageUnavailable"
      );
    }
    mediaLogger.error("upload_route_failed", {
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.name : "unknown",
    });
    return jsonError(
      (await getServerDictionary()).t.admin.forms.uploadErrors.failed,
      500
    );
  }
}

export async function DELETE() {
  try {
    await requireAdminAction();
    const [idempotencyRemoved, orphansRemoved] = await Promise.all([
      cleanupStaleIdempotencyRecords(),
      cleanupOrphanedStorageObjects(),
    ]);
    return Response.json({
      idempotencyRemoved,
      orphansRemoved,
      metrics: mediaMetrics.snapshot(),
    });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
