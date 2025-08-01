/*
  Warnings:

  - A unique constraint covering the columns `[spaceId]` on the table `CurrentStream` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Provider" ADD VALUE 'Credentials';

-- AlterTable
ALTER TABLE "CurrentStream" ADD COLUMN     "spaceId" TEXT;

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "spaceId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_spaceId_key" ON "CurrentStream"("spaceId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
