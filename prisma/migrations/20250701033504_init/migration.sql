-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterSettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "facebookUrl" TEXT NOT NULL,
    "instagramUrl" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "copyrightText" TEXT NOT NULL,
    "developerName" TEXT NOT NULL,
    "developerUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterSettings_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonLink" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "SecondSection" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "reasons" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecondSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThirdSection" (
    "id" TEXT NOT NULL DEFAULT 'third-section',
    "heading" TEXT NOT NULL,
    "subheading" TEXT NOT NULL,
    "imageUrl" TEXT,
    "services" TEXT[],

    CONSTRAINT "ThirdSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "reviews" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'lv',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SixthSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonLink" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SixthSection_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "WhyChooseUs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "points" TEXT[],
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyChooseUs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnersSection" (
    "id" TEXT NOT NULL DEFAULT 'partners-section',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "partners" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnersSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccessRequest_email_idx" ON "AccessRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_name_phone_key" ON "Agent"("name", "phone");
