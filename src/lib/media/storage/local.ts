import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { mediaConfig } from "../config";
import { toNodeStream } from "./streams";
import type { MediaStorageProvider, PutObjectInput } from "./types";

export class LocalMediaStorageProvider implements MediaStorageProvider {
  readonly name = "local";

  private absolutePath(key: string): string {
    const normalized = path.normalize(key).replace(/^(\.\.[/\\])+/, "");
    if (normalized.includes("..")) {
      throw new Error("Invalid storage key");
    }
    return path.join(process.cwd(), mediaConfig.local.rootDir, normalized);
  }

  getPublicUrl(key: string): string {
    const base = mediaConfig.local.publicBasePath.replace(/\/$/, "");
    return `${base}/${key}`;
  }

  isManagedUrl(url: string): boolean {
    const base = mediaConfig.local.publicBasePath.replace(/\/$/, "");
    return url.startsWith(`${base}/`);
  }

  keyFromPublicUrl(url: string): string | null {
    const base = mediaConfig.local.publicBasePath.replace(/\/$/, "");
    if (!url.startsWith(`${base}/`)) return null;
    return url.slice(base.length + 1);
  }

  async putObject(input: PutObjectInput): Promise<void> {
    const target = this.absolutePath(input.key);
    await mkdir(path.dirname(target), { recursive: true });
    const stream = toNodeStream(input.body);
    await pipeline(stream, createWriteStream(target));
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await unlink(this.absolutePath(key));
    } catch {
      /* already removed */
    }
  }
}
