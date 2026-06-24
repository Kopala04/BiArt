import type { MediaStorageProviderName } from "./types";

function readInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readProvider(): MediaStorageProviderName {
  const raw = (process.env.MEDIA_STORAGE_PROVIDER ?? "").toLowerCase();
  if (raw === "s3") return "s3";
  if (raw === "vercel-blob") return "vercel-blob";
  if (raw === "local") return "local";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  return "local";
}

export const mediaConfig = {
  provider: readProvider(),
  limits: {
    maxImageBytes: readInt("MEDIA_MAX_IMAGE_BYTES", 10 * 1024 * 1024),
    maxVideoBytes: readInt("MEDIA_MAX_VIDEO_BYTES", 50 * 1024 * 1024),
    uploadTimeoutMs: readInt("MEDIA_UPLOAD_TIMEOUT_MS", 120_000),
    rateLimitPerMinute: readInt("MEDIA_UPLOAD_RATE_LIMIT_PER_MINUTE", 30),
    pageSize: readInt("MEDIA_ADMIN_PAGE_SIZE", 24),
    idempotencyTtlHours: readInt("MEDIA_IDEMPOTENCY_TTL_HOURS", 24),
  },
  local: {
    rootDir: process.env.MEDIA_LOCAL_ROOT ?? "public/uploads",
    publicBasePath: process.env.MEDIA_LOCAL_PUBLIC_BASE ?? "/uploads",
  },
  s3: {
    bucket: process.env.S3_BUCKET ?? "",
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    publicUrlBase: process.env.S3_PUBLIC_URL_BASE,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  },
  vercelBlob: {
    token: process.env.BLOB_READ_WRITE_TOKEN ?? "",
  },
} as const;
