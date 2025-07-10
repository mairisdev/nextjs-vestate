-- CreateTable
CREATE TABLE "SevenSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonLink" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SevenSection_pkey" PRIMARY KEY ("id")
);
