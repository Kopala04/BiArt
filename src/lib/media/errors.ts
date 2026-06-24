export const MEDIA_UPLOAD_ERROR_CODES = [
  "emptyFile",
  "invalidType",
  "invalidContent",
  "imageTooLarge",
  "videoTooLarge",
  "mediaRequired",
  "staleItem",
  "failed",
  "rateLimited",
  "timeout",
  "duplicateInFlight",
] as const;

export type MediaUploadErrorCode = (typeof MEDIA_UPLOAD_ERROR_CODES)[number];

export class MediaUploadError extends Error {
  constructor(public readonly code: MediaUploadErrorCode) {
    super(code);
    this.name = "MediaUploadError";
  }
}
