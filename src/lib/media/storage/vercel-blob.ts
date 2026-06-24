import { Readable } from "node:stream";
import {
  vercelBlobClientOptions,
  vercelBlobPutOptions,
  assertVercelBlobAuthForUpload,
} from "../vercel-blob-auth";
import type { MediaStorageProvider, PutObjectInput } from "./types";

type VercelPutBody = Blob | Buffer | ReadableStream<Uint8Array>;

function toPutBody(body: PutObjectInput["body"]): VercelPutBody {
  if (body instanceof Blob) return body;
  if (body instanceof Buffer) return body;
  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }
  return body;
}

export class VercelBlobMediaStorageProvider implements MediaStorageProvider {
  readonly name = "vercel-blob";

  getPublicUrl(key: string): string {
    // put() returns the canonical URL; callers should persist that value.
    return key;
  }

  isManagedUrl(url: string): boolean {
    return url.includes(".blob.vercel-storage.com/");
  }

  keyFromPublicUrl(url: string): string | null {
    return this.isManagedUrl(url) ? url : null;
  }

  async putObject(input: PutObjectInput): Promise<void> {
    await putVercelBlobObject(input);
  }

  async deleteObject(keyOrUrl: string): Promise<void> {
    const { del } = await import("@vercel/blob");
    await del(keyOrUrl, vercelBlobClientOptions());
  }
}

/** Vercel put returns URL separately because keys are not public URLs. */
export async function putVercelBlobObject(
  input: PutObjectInput
): Promise<string> {
  assertVercelBlobAuthForUpload();
  const { put } = await import("@vercel/blob");
  const result = await put(
    input.key,
    toPutBody(input.body),
    vercelBlobPutOptions(input.contentType)
  );
  return result.url;
}
