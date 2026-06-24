import { Readable } from "node:stream";
import type { PutObjectInput } from "./types";

export function toNodeStream(body: PutObjectInput["body"]): Readable {
  if (body instanceof Readable) return body;
  if (body instanceof Buffer) return Readable.from(body);
  if (body instanceof Blob) {
    return Readable.fromWeb(
      body.stream() as Parameters<typeof Readable.fromWeb>[0]
    );
  }
  return Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]);
}
