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
  return Boolean(readEnv("BLOB_READ_WRITE_TOKEN") || readEnv("BLOB_STORE_ID"));
}

export function vercelBlobClientOptions(): {
  token?: string;
  storeId?: string;
} {
  const token = readEnv("BLOB_READ_WRITE_TOKEN");
  const storeId = readEnv("BLOB_STORE_ID");
  return {
    ...(token ? { token } : {}),
    ...(storeId ? { storeId } : {}),
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
  return {
    hasBlobToken: Boolean(readEnv("BLOB_READ_WRITE_TOKEN")),
    hasBlobStoreId: Boolean(readEnv("BLOB_STORE_ID")),
    hasOidcToken: Boolean(readEnv("VERCEL_OIDC_TOKEN")),
    configured: hasVercelBlobCredentials(),
  };
}
