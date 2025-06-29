-- CreateTable
CREATE TABLE "NavigationSettings" (
    "id" TEXT NOT NULL,
    "logoAlt" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "securityText" TEXT NOT NULL,
    "menuItems" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationSettings_pkey" PRIMARY KEY ("id")
);
