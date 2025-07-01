-- CreateTable
CREATE TABLE "ContactSettings" (
    "id" TEXT NOT NULL DEFAULT 'contact-section',
    "heading" TEXT NOT NULL,
    "subtext" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSettings_pkey" PRIMARY KEY ("id")
);
