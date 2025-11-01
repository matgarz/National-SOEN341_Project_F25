-- AlterTable
ALTER TABLE `event` MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `accountStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN `organizationId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `user_accountStatus_idx` ON `user`(`accountStatus`);

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
