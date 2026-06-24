-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "mediaStorageKey" TEXT;
ALTER TABLE "MediaItem" ADD COLUMN "thumbnailStorageKey" TEXT;

-- CreateTable
CREATE TABLE "MediaUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "MediaUpload_createdAt_idx" ON "MediaUpload"("createdAt");
CREATE INDEX "MediaUpload_storageKey_idx" ON "MediaUpload"("storageKey");
