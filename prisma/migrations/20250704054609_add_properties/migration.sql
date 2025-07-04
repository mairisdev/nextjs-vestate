-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "PropertyCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "rooms" INTEGER,
    "area" DOUBLE PRECISION,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "categoryId" TEXT NOT NULL,
    "mainImage" TEXT,
    "images" TEXT[],
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyCategory_name_key" ON "PropertyCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyCategory_slug_key" ON "PropertyCategory"("slug");

-- CreateIndex
CREATE INDEX "Property_categoryId_idx" ON "Property"("categoryId");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_isActive_idx" ON "Property"("isActive");

-- CreateIndex
CREATE INDEX "Property_isFeatured_idx" ON "Property"("isFeatured");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PropertyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
