import { readMediaProvider } from "../config";
import { hasVercelBlobCredentials } from "../vercel-blob-auth";
import { LocalMediaStorageProvider } from "./local";
import { S3MediaStorageProvider } from "./s3";
import type { MediaStorageProvider } from "./types";
import { VercelBlobMediaStorageProvider } from "./vercel-blob";

let cached: MediaStorageProvider | null = null;
let cachedName: string | null = null;

export function getMediaStorageProvider(): MediaStorageProvider {
  const providerName = readMediaProvider();
  if (cached && cachedName === providerName) {
    return cached;
  }

  const onVercel = process.env.VERCEL === "1";

  switch (providerName) {
    case "s3":
      cached = new S3MediaStorageProvider();
      break;
    case "vercel-blob":
      if (!onVercel && !hasVercelBlobCredentials()) {
        cached = new LocalMediaStorageProvider();
        break;
      }
      cached = new VercelBlobMediaStorageProvider();
      break;
    case "local":
    default:
      if (onVercel) {
        throw new Error("MEDIA_STORAGE_UNAVAILABLE");
      }
      cached = new LocalMediaStorageProvider();
      break;
  }

  cachedName = providerName;
  return cached;
}

export function resetMediaStorageProviderForTests() {
  cached = null;
  cachedName = null;
}
