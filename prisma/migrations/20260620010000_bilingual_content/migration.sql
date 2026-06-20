-- AlterTable
ALTER TABLE "Package" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Package" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "Package" ADD COLUMN "servicesEn" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Service" ADD COLUMN "descriptionEn" TEXT;

-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "MediaItem" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "MediaItem" ADD COLUMN "tagsEn" TEXT;
