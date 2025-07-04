/*
  Warnings:

  - You are about to drop the column `views` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "views";

-- CreateTable
CREATE TABLE "PropertyView" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyView_propertyId_idx" ON "PropertyView"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyView_ipAddress_idx" ON "PropertyView"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyView_propertyId_ipAddress_key" ON "PropertyView"("propertyId", "ipAddress");

-- AddForeignKey
ALTER TABLE "PropertyView" ADD CONSTRAINT "PropertyView_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
