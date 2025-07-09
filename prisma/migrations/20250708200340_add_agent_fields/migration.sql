/*
  Warnings:

  - A unique constraint covering the columns `[clerkId]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "clerkId" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Agent_clerkId_key" ON "Agent"("clerkId");
