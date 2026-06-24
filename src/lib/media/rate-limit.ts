import { mediaConfig } from "./config";

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function checkUploadRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = mediaConfig.limits.rateLimitPerMinute;
  const bucket = buckets.get(userId) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

  if (bucket.timestamps.length >= limit) {
    buckets.set(userId, bucket);
    return false;
  }

  bucket.timestamps.push(now);
  buckets.set(userId, bucket);
  return true;
}

export function resetUploadRateLimitsForTests() {
  buckets.clear();
}
