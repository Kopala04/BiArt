import type { PutCommandOptions } from "@vercel/blob";

/** Vercel Blob via static token or OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN). */
export function hasVercelBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim()
  );
}

export function vercelBlobClientOptions(): {
  token?: string;
} {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token ? { token } : {};
}

export function vercelBlobPutOptions(contentType: string): PutCommandOptions {
  return {
    access: "public",
    contentType,
    addRandomSuffix: false,
    ...vercelBlobClientOptions(),
  };
}
