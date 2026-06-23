-- AlterTable
ALTER TABLE "PrintProduct" ADD COLUMN "maxQuantity" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "printProductId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "quantity" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "orderOnly" INTEGER NOT NULL DEFAULT 0;
