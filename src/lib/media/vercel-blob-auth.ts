import type { PutCommandOptions } from "@vercel/blob";

function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^["']|["']$/g, "");
}

/** Vercel Blob via static token or OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN). */
export function hasVercelBlobCredentials(): boolean {
  return Boolean(
    readEnv("BLOB_READ_WRITE_TOKEN") ||
      readEnv("BLOB_STORE_ID") ||
      readEnv("VERCEL_OIDC_TOKEN")
  );
}

export function hasVercelBlobAuthForUpload(): boolean {
  return Boolean(readEnv("BLOB_READ_WRITE_TOKEN") || readEnv("VERCEL_OIDC_TOKEN"));
}

export function vercelBlobClientOptions(): {
  token?: string;
  storeId?: string;
  oidcToken?: string;
} {
  const token = readEnv("BLOB_READ_WRITE_TOKEN");
  const storeId = readEnv("BLOB_STORE_ID");
  const oidcToken = readEnv("VERCEL_OIDC_TOKEN");

  return {
    ...(token ? { token } : {}),
    ...(storeId ? { storeId } : {}),
    ...(oidcToken ? { oidcToken } : {}),
  };
}

export function vercelBlobPutOptions(contentType: string): PutCommandOptions {
  return {
    access: "public",
    contentType,
    addRandomSuffix: false,
    ...vercelBlobClientOptions(),
  };
}

export function getVercelBlobDiagnostics() {
  const hasBlobToken = Boolean(readEnv("BLOB_READ_WRITE_TOKEN"));
  const hasBlobStoreId = Boolean(readEnv("BLOB_STORE_ID"));
  const hasOidcToken = Boolean(readEnv("VERCEL_OIDC_TOKEN"));

  return {
    hasBlobToken,
    hasBlobStoreId,
    hasOidcToken,
    configured: hasVercelBlobCredentials(),
    readyForUpload: hasVercelBlobAuthForUpload(),
  };
}

export function assertVercelBlobAuthForUpload(): void {
  if (hasVercelBlobAuthForUpload()) return;

  if (readEnv("BLOB_STORE_ID")) {
    throw new Error("BLOB_AUTH_MISSING");
  }

  throw new Error("MEDIA_STORAGE_UNAVAILABLE");
}
