/*
  Warnings:

  - You are about to drop the column `organizationId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `event_organizerId_fkey`;

-- DropForeignKey
ALTER TABLE `organizer` DROP FOREIGN KEY `organizer_organizationId_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `organizationId`;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `Organizer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organizer` ADD CONSTRAINT `Organizer_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `event` RENAME INDEX `event_organizerId_fkey` TO `Event_organizerId_idx`;

-- RenameIndex
ALTER TABLE `organizer` RENAME INDEX `organizer_isActive_idx` TO `Organizer_isActive_idx`;

-- RenameIndex
ALTER TABLE `organizer` RENAME INDEX `organizer_organizationId_idx` TO `Organizer_organizationId_idx`;
