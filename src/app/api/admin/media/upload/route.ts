import { randomUUID } from "node:crypto";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n/server";
import {
  cleanupOrphanedStorageObjects,
  cleanupStaleIdempotencyRecords,
} from "@/lib/media/cleanup";
import { readMediaProvider } from "@/lib/media/config";
import { MediaUploadError } from "@/lib/media/errors";
import { mediaLogger } from "@/lib/media/logger";
import { mediaMetrics } from "@/lib/media/metrics";
import { checkUploadRateLimit } from "@/lib/media/rate-limit";
import { uploadMediaFiles } from "@/lib/media/upload-service";
import { getVercelBlobDiagnostics } from "@/lib/media/vercel-blob-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number, code?: string) {
  return Response.json({ error: message, code: code ?? "failed" }, { status });
}

function statusForUploadError(code: string): number {
  switch (code) {
    case "rateLimited":
      return 429;
    case "storageUnavailable":
    case "blobAuthMissing":
      return 503;
    case "timeout":
      return 408;
    case "unauthorized":
      return 401;
    default:
      return 400;
  }
}

function requireAdminSession(authSession: Session | null | undefined) {
  if (!authSession?.user || authSession.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return authSession;
}

export const GET = auth(async (request) => {
  try {
    const { t } = await getServerDictionary();
    requireAdminSession(request.auth);

    const blob = getVercelBlobDiagnostics();
    return Response.json({
      provider: readMediaProvider(),
      onVercel: process.env.VERCEL === "1",
      blob,
      hint: !blob.readyForUpload && blob.hasBlobStoreId
        ? t.admin.forms.uploadErrors.blobAuthMissing
        : t.admin.forms.uploadErrors.storageUnavailable,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401, "unauthorized");
    }
    return jsonError("Failed", 500, "failed");
  }
});

export const POST = auth(async (request) => {
  const started = Date.now();

  try {
    const session = requireAdminSession(request.auth);
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
      provider: readMediaProvider(),
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
      mediaLogger.error("upload_route_media_error", {
        code: error.code,
        durationMs: Date.now() - started,
      });
      return jsonError(
        t.admin.forms.uploadErrors[key] ?? t.admin.forms.uploadErrors.failed,
        statusForUploadError(error.code),
        error.code
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError(t.admin.forms.uploadErrors.unauthorized, 401, "unauthorized");
    }
    if (error instanceof Error && error.message === "BLOB_AUTH_MISSING") {
      return jsonError(t.admin.forms.uploadErrors.blobAuthMissing, 503, "blobAuthMissing");
    }
    if (error instanceof Error && error.message === "MEDIA_STORAGE_UNAVAILABLE") {
      return jsonError(
        t.admin.forms.uploadErrors.storageUnavailable,
        503,
        "storageUnavailable"
      );
    }
    const blobDiag = getVercelBlobDiagnostics();
    mediaLogger.error("upload_route_failed", {
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : "unknown",
      provider: readMediaProvider(),
      blobConfigured: blobDiag.configured,
      hasBlobToken: blobDiag.hasBlobToken,
      hasBlobStoreId: blobDiag.hasBlobStoreId,
      hasOidcToken: blobDiag.hasOidcToken,
    });
    return jsonError(t.admin.forms.uploadErrors.failed, 500, "failed");
  }
});

export const DELETE = auth(async (request) => {
  try {
    requireAdminSession(request.auth);
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
    return jsonError("Unauthorized", 401, "unauthorized");
  }
});
