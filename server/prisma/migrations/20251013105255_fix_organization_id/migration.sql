/*
  Warnings:

  - You are about to drop the column `organiztionId` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `organiztionId`,
    ADD COLUMN `organizationId` VARCHAR(191) NULL;
