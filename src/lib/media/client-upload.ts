import type { UploadBatchResult } from "./types";

export type ClientUploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type ClientUploadOptions = {
  mediaFile?: File | null;
  thumbnailFile?: File | null;
  mediaIdempotencyKey?: string;
  thumbnailIdempotencyKey?: string;
  signal?: AbortSignal;
  onProgress?: (progress: ClientUploadProgress) => void;
};

type ApiUploadResponse = {
  media?: {
    mediaUrl: string;
    mediaStorageKey: string;
    mimeType: string;
    byteSize: number;
  };
  thumbnail?: {
    thumbnailUrl: string;
    thumbnailStorageKey: string;
    mimeType: string;
    byteSize: number;
  };
  error?: string;
};

function fileFingerprint(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

const recentUploads = new Map<string, UploadBatchResult>();

function mapApiResponse(body: ApiUploadResponse): UploadBatchResult {
  return {
    media: body.media
      ? {
          publicUrl: body.media.mediaUrl,
          storageKey: body.media.mediaStorageKey,
          mimeType: body.media.mimeType,
          byteSize: body.media.byteSize,
        }
      : undefined,
    thumbnail: body.thumbnail
      ? {
          publicUrl: body.thumbnail.thumbnailUrl,
          storageKey: body.thumbnail.thumbnailStorageKey,
          mimeType: body.thumbnail.mimeType,
          byteSize: body.thumbnail.byteSize,
        }
      : undefined,
  };
}

export function uploadMediaBatch(
  options: ClientUploadOptions
): Promise<UploadBatchResult & { error?: string }> {
  const { mediaFile, thumbnailFile, signal, onProgress } = options;

  if (!mediaFile && !thumbnailFile) {
    return Promise.resolve({ error: "mediaRequired" });
  }

  const fingerprints: string[] = [];
  if (mediaFile) fingerprints.push(fileFingerprint(mediaFile));
  if (thumbnailFile) fingerprints.push(fileFingerprint(thumbnailFile));
  const cacheKey = fingerprints.join("|");
  const cached = recentUploads.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    if (mediaFile) {
      formData.set("mediaFile", mediaFile);
      if (options.mediaIdempotencyKey) {
        formData.set("mediaIdempotencyKey", options.mediaIdempotencyKey);
      }
    }
    if (thumbnailFile) {
      formData.set("thumbnailFile", thumbnailFile);
      if (options.thumbnailIdempotencyKey) {
        formData.set("thumbnailIdempotencyKey", options.thumbnailIdempotencyKey);
      }
    }

    xhr.open("POST", "/api/admin/media/upload");
    xhr.responseType = "json";

    if (signal) {
      if (signal.aborted) {
        resolve({ error: "failed" });
        return;
      }
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: Math.round((event.loaded / event.total) * 100),
      });
    };

    xhr.onload = () => {
      const body = xhr.response as ApiUploadResponse;
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = mapApiResponse(body);
        recentUploads.set(cacheKey, result);
        resolve(result);
        return;
      }
      resolve({ error: body?.error ?? "failed" });
    };

    xhr.onerror = () => resolve({ error: "failed" });
    xhr.onabort = () => resolve({ error: "failed" });
    xhr.send(formData);
  });
}

export function resetClientUploadCacheForTests() {
  recentUploads.clear();
}
