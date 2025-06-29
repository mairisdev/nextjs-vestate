-- CreateTable
CREATE TABLE "FirstSection" (
    "id" TEXT NOT NULL,
    "backgroundImage" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirstSection_pkey" PRIMARY KEY ("id")
);
