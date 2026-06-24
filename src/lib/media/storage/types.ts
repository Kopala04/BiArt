import type { Readable } from "node:stream";

export type PutObjectInput = {
  key: string;
  body: Readable | ReadableStream<Uint8Array> | Blob | Buffer;
  contentType: string;
  contentLength: number;
};

export interface MediaStorageProvider {
  readonly name: string;
  putObject(input: PutObjectInput): Promise<void>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl(key: string): string;
  isManagedUrl(url: string): boolean;
  keyFromPublicUrl(url: string): string | null;
}
