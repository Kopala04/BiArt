import { S3Client } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { mediaConfig } from "../config";
import { toNodeStream } from "./streams";
import type { MediaStorageProvider, PutObjectInput } from "./types";

export class S3MediaStorageProvider implements MediaStorageProvider {
  readonly name = "s3";
  private readonly client: S3Client;

  constructor() {
    const { s3 } = mediaConfig;
    if (!s3.bucket || !s3.accessKeyId || !s3.secretAccessKey) {
      throw new Error("S3 storage is not fully configured");
    }
    this.client = new S3Client({
      region: s3.region,
      endpoint: s3.endpoint,
      forcePathStyle: s3.forcePathStyle,
      credentials: {
        accessKeyId: s3.accessKeyId,
        secretAccessKey: s3.secretAccessKey,
      },
    });
  }

  getPublicUrl(key: string): string {
    const base = mediaConfig.s3.publicUrlBase?.replace(/\/$/, "");
    if (base) return `${base}/${key}`;
    if (mediaConfig.s3.endpoint && mediaConfig.s3.forcePathStyle) {
      const endpoint = mediaConfig.s3.endpoint.replace(/\/$/, "");
      return `${endpoint}/${mediaConfig.s3.bucket}/${key}`;
    }
    return `https://${mediaConfig.s3.bucket}.s3.${mediaConfig.s3.region}.amazonaws.com/${key}`;
  }

  isManagedUrl(url: string): boolean {
    const key = this.keyFromPublicUrl(url);
    return key !== null;
  }

  keyFromPublicUrl(url: string): string | null {
    const base = mediaConfig.s3.publicUrlBase?.replace(/\/$/, "");
    if (base && url.startsWith(`${base}/`)) {
      return url.slice(base.length + 1);
    }
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === mediaConfig.s3.bucket) {
        return parts.slice(1).join("/");
      }
      return parts.join("/");
    } catch {
      return null;
    }
  }

  async putObject(input: PutObjectInput): Promise<void> {
    const stream = toNodeStream(input.body);
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: mediaConfig.s3.bucket,
        Key: input.key,
        Body: stream,
        ContentType: input.contentType,
        ContentLength: input.contentLength,
      },
    });
    await upload.done();
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: mediaConfig.s3.bucket,
        Key: key,
      })
    );
  }
}
