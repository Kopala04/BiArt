import { mediaConfig } from "./config";
import { MediaUploadError } from "./errors";
import type { MediaUploadKind } from "./types";

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);
const VIDEO_MIMES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const SIGNATURES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  { mime: "image/heic", bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 },
  { mime: "video/mp4", bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 },
  { mime: "video/webm", bytes: [0x1a, 0x45, 0xdf, 0xa3] },
];

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".php",
  ".js",
  ".html",
  ".svg",
]);

export function sanitizeOriginalFilename(name: string): string {
  const base = name.replace(/[/\\]/g, "").replace(/\.\./g, "").trim();
  return base.slice(0, 120) || "file";
}

export function extensionForMime(mime: string): string {
  return MIME_EXT[mime] ?? "";
}

export function detectMimeFromHeader(header: Uint8Array, declared?: string): string | null {
  for (const sig of SIGNATURES) {
    const offset = sig.offset ?? 0;
    if (header.length < offset + sig.bytes.length) continue;
    const matches = sig.bytes.every((byte, i) => header[offset + i] === byte);
    if (matches) return sig.mime;
  }

  if (declared && (IMAGE_MIMES.has(declared) || VIDEO_MIMES.has(declared))) {
    if (declared === "image/avif") {
      return declared;
    }
    if (declared === "image/heic" || declared === "image/heif") {
      const hasFtyp =
        header.length >= 8 &&
        header[4] === 0x66 &&
        header[5] === 0x74 &&
        header[6] === 0x79 &&
        header[7] === 0x70;
      return hasFtyp ? declared : null;
    }
    if (declared === "video/quicktime") {
      return header.length >= 4 ? declared : null;
    }
  }

  return null;
}

export function assertAllowedMime(mime: string, kind: MediaUploadKind): void {
  const isImage = IMAGE_MIMES.has(mime);
  const isVideo = kind === "media" && VIDEO_MIMES.has(mime);
  if (!isImage && !isVideo) {
    throw new MediaUploadError("invalidType");
  }
}

export function assertAllowedSize(byteSize: number, mime: string): void {
  const isVideo = VIDEO_MIMES.has(mime);
  const max = isVideo
    ? mediaConfig.limits.maxVideoBytes
    : mediaConfig.limits.maxImageBytes;
  if (byteSize <= 0) throw new MediaUploadError("emptyFile");
  if (byteSize > max) {
    throw new MediaUploadError(isVideo ? "videoTooLarge" : "imageTooLarge");
  }
}

export function assertSafeExtension(filename: string): void {
  const ext = filename.includes(".")
    ? `.${filename.split(".").pop()?.toLowerCase()}`
    : "";
  if (ext && BLOCKED_EXTENSIONS.has(ext)) {
    throw new MediaUploadError("invalidType");
  }
}

export async function readFileHeader(file: File, size = 32): Promise<Uint8Array> {
  const slice = file.slice(0, size);
  return new Uint8Array(await slice.arrayBuffer());
}

export function validateUploadFile(
  file: File,
  kind: MediaUploadKind,
  header: Uint8Array
): { mimeType: string; byteSize: number } {
  if (!(file instanceof File) || file.size <= 0) {
    throw new MediaUploadError("emptyFile");
  }

  assertSafeExtension(sanitizeOriginalFilename(file.name));
  const mimeType =
    detectMimeFromHeader(header, file.type) ??
    (file.type && (IMAGE_MIMES.has(file.type) || VIDEO_MIMES.has(file.type))
      ? file.type
      : null);

  if (!mimeType) {
    throw new MediaUploadError("invalidContent");
  }

  assertAllowedMime(mimeType, kind);
  assertAllowedSize(file.size, mimeType);

  if (file.type && file.type !== mimeType && mimeType !== "image/avif") {
    mediaLoggerWarnMimeMismatch(file.type, mimeType);
  }

  return { mimeType, byteSize: file.size };
}

function mediaLoggerWarnMimeMismatch(declared: string, detected: string) {
  // Lazy import avoids circular dependency with logger in tests.
  import("./logger").then(({ mediaLogger }) =>
    mediaLogger.warn("mime_declared_mismatch", { declared, detected })
  );
}
