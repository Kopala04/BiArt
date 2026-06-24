export type MediaStorageProviderName = "local" | "s3" | "vercel-blob";

export type MediaUploadKind = "media" | "thumbnail";

export type StoredObject = {
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  byteSize: number;
};

export type UploadFileInput = {
  file: File;
  kind: MediaUploadKind;
  idempotencyKey?: string;
};

export type UploadBatchResult = {
  media?: StoredObject;
  thumbnail?: StoredObject;
};

export type UploadMetricsSnapshot = {
  uploadsStarted: number;
  uploadsSucceeded: number;
  uploadsFailed: number;
  bytesStored: number;
  totalDurationMs: number;
};
