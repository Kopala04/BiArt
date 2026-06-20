-- AlterTable
ALTER TABLE "User" ADD COLUMN "consultationBookingId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packageId" TEXT,
    "serviceId" TEXT,
    "userId" TEXT,
    "consultationBookingId" TEXT,
    "schedulingSkipped" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "company" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_consultationBookingId_fkey" FOREIGN KEY ("consultationBookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("id", "packageId", "serviceId", "userId", "date", "timeSlot", "status", "clientName", "clientEmail", "clientPhone", "company", "notes", "createdAt", "updatedAt") SELECT "id", "packageId", "serviceId", "userId", "date", "timeSlot", "status", "clientName", "clientEmail", "clientPhone", "company", "notes", "createdAt", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'B_USER',
    "activePackageId" TEXT,
    "consultationBookingId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_activePackageId_fkey" FOREIGN KEY ("activePackageId") REFERENCES "Package" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_consultationBookingId_fkey" FOREIGN KEY ("consultationBookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("id", "email", "passwordHash", "name", "company", "phone", "role", "activePackageId", "createdAt", "updatedAt") SELECT "id", "email", "passwordHash", "name", "company", "phone", "role", "activePackageId", "createdAt", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_consultationBookingId_key" ON "User"("consultationBookingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
