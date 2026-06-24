import { MediaUploadError } from "./errors";

const BLOB_STORAGE_ERROR_NAMES = new Set([
  "BlobStoreNotFoundError",
  "BlobServiceNotAvailable",
  "BlobAccessError",
  "BlobClientTokenExpiredError",
]);

export function mapStorageError(error: unknown): MediaUploadError {
  if (error instanceof MediaUploadError) return error;
  if (error instanceof Error) {
    if (error.message === "MEDIA_STORAGE_UNAVAILABLE") {
      return new MediaUploadError("storageUnavailable");
    }
    if (BLOB_STORAGE_ERROR_NAMES.has(error.name)) {
      return new MediaUploadError("storageUnavailable");
    }
    if (error.message.toLowerCase().includes("token")) {
      return new MediaUploadError("storageUnavailable");
    }
  }
  return new MediaUploadError("failed");
}
