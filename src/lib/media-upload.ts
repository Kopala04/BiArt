/**
 * @deprecated Import from `@/lib/media/*` instead. Kept for backward compatibility.
 */
export { MediaUploadError } from "@/lib/media/errors";
export {
  deleteStoredObject as deleteStoredMedia,
  isManagedMediaUrl as isStoredMediaUrl,
  uploadMediaFiles,
} from "@/lib/media/upload-service";

import { uploadMediaFiles } from "@/lib/media/upload-service";
import type { UploadFileInput } from "@/lib/media/types";

/** @deprecated Use uploadMediaFiles */
export async function uploadMediaFile(file: File): Promise<string> {
  const result = await uploadMediaFiles([{ file, kind: "media" }]);
  return result.media!.publicUrl;
}

/** @deprecated Use uploadMediaFiles */
export async function uploadThumbnailFile(file: File): Promise<string> {
  const result = await uploadMediaFiles([{ file, kind: "thumbnail" }]);
  return result.thumbnail!.publicUrl;
}

export type { UploadFileInput };
