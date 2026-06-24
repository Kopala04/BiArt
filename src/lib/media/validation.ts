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
  "image/bmp",
  "image/tiff",
]);
const VIDEO_MIMES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
  "image/x-bmp": "image/bmp",
  "image/x-tiff": "image/tiff",
  "image/tif": "image/tiff",
};

const EXTENSION_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jpe: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  heic: "image/heic",
  heif: "image/heif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "image/bmp": ".bmp",
  "image/tiff": ".tif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const SIGNATURES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  { mime: "image/bmp", bytes: [0x42, 0x4d] },
  { mime: "image/tiff", bytes: [0x49, 0x49, 0x2a, 0x00] },
  { mime: "image/tiff", bytes: [0x4d, 0x4d, 0x00, 0x2a] },
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

export function normalizeMimeType(mime: string): string {
  const trimmed = mime.trim().toLowerCase();
  return MIME_ALIASES[trimmed] ?? trimmed;
}

export function mimeFromFilename(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  return EXTENSION_MIME[ext] ?? null;
}

export function sanitizeOriginalFilename(name: string): string {
  const base = name.replace(/[/\\]/g, "").replace(/\.\./g, "").trim();
  return base.slice(0, 120) || "file";
}

export function extensionForMime(mime: string): string {
  return MIME_EXT[mime] ?? "";
}

function isFtypContainer(header: Uint8Array): boolean {
  return (
    header.length >= 8 &&
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  );
}

export function detectMimeFromHeader(header: Uint8Array, declared?: string): string | null {
  const normalizedDeclared = declared ? normalizeMimeType(declared) : undefined;

  for (const sig of SIGNATURES) {
    const offset = sig.offset ?? 0;
    if (header.length < offset + sig.bytes.length) continue;
    const matches = sig.bytes.every((byte, i) => header[offset + i] === byte);
    if (!matches) continue;

    if (sig.mime === "image/heic" || sig.mime === "video/mp4") {
      if (normalizedDeclared && IMAGE_MIMES.has(normalizedDeclared)) {
        return normalizedDeclared;
      }
      if (normalizedDeclared && VIDEO_MIMES.has(normalizedDeclared)) {
        return normalizedDeclared;
      }
      if (sig.mime === "video/mp4" && !isFtypContainer(header)) continue;
    }

    return sig.mime;
  }

  if (normalizedDeclared && (IMAGE_MIMES.has(normalizedDeclared) || VIDEO_MIMES.has(normalizedDeclared))) {
    if (normalizedDeclared === "image/avif") {
      return normalizedDeclared;
    }
    if (normalizedDeclared === "image/heic" || normalizedDeclared === "image/heif") {
      return isFtypContainer(header) ? normalizedDeclared : null;
    }
    if (normalizedDeclared === "video/quicktime") {
      return header.length >= 4 ? normalizedDeclared : null;
    }
    if (normalizedDeclared === "image/jpeg" || normalizedDeclared === "image/png") {
      return normalizedDeclared;
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

  const safeName = sanitizeOriginalFilename(file.name);
  assertSafeExtension(safeName);

  const declared = file.type ? normalizeMimeType(file.type) : "";
  const mimeType =
    detectMimeFromHeader(header, declared || undefined) ??
    (declared && (IMAGE_MIMES.has(declared) || VIDEO_MIMES.has(declared))
      ? declared
      : null) ??
    mimeFromFilename(safeName);

  if (!mimeType) {
    throw new MediaUploadError("invalidContent");
  }

  assertAllowedMime(mimeType, kind);
  assertAllowedSize(file.size, mimeType);

  if (declared && declared !== mimeType && mimeType !== "image/avif") {
    mediaLoggerWarnMimeMismatch(declared, mimeType);
  }

  return { mimeType, byteSize: file.size };
}

function mediaLoggerWarnMimeMismatch(declared: string, detected: string) {
  import("./logger").then(({ mediaLogger }) =>
    mediaLogger.warn("mime_declared_mismatch", { declared, detected })
  );
}
