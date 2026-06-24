import { mediaConfig } from "../config";
import { LocalMediaStorageProvider } from "./local";
import { S3MediaStorageProvider } from "./s3";
import type { MediaStorageProvider } from "./types";
import { VercelBlobMediaStorageProvider } from "./vercel-blob";

let cached: MediaStorageProvider | null = null;

export function getMediaStorageProvider(): MediaStorageProvider {
  if (cached) return cached;

  const onVercel = process.env.VERCEL === "1";

  switch (mediaConfig.provider) {
    case "s3":
      cached = new S3MediaStorageProvider();
      break;
    case "vercel-blob":
      if (!mediaConfig.vercelBlob.token) {
        if (onVercel) {
          throw new Error("MEDIA_STORAGE_UNAVAILABLE");
        }
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

  return cached;
}

export function resetMediaStorageProviderForTests() {
  cached = null;
}
