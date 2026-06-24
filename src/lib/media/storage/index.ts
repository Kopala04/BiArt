import { mediaConfig } from "../config";
import { LocalMediaStorageProvider } from "./local";
import { S3MediaStorageProvider } from "./s3";
import type { MediaStorageProvider } from "./types";
import { VercelBlobMediaStorageProvider } from "./vercel-blob";

let cached: MediaStorageProvider | null = null;

export function getMediaStorageProvider(): MediaStorageProvider {
  if (cached) return cached;

  switch (mediaConfig.provider) {
    case "s3":
      cached = new S3MediaStorageProvider();
      break;
    case "vercel-blob":
      cached = new VercelBlobMediaStorageProvider();
      break;
    case "local":
    default:
      cached = new LocalMediaStorageProvider();
      break;
  }

  return cached;
}

export function resetMediaStorageProviderForTests() {
  cached = null;
}
