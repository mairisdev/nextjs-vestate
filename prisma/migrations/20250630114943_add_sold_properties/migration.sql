-- CreateTable
CREATE TABLE "SoldProperty" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "size" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoldProperty_pkey" PRIMARY KEY ("id")
);
