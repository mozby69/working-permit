/*
  Warnings:

  - You are about to drop the column `remarks` on the `working_permit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `working_permit` DROP COLUMN `remarks`;

-- CreateTable
CREATE TABLE `working_permit_remarks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `working_permit_id` VARCHAR(36) NOT NULL,
    `description` TEXT NOT NULL,
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `working_permit_remarks_working_permit_id_created_at_idx`(`working_permit_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `working_permit_remarks` ADD CONSTRAINT `working_permit_remarks_working_permit_id_fkey` FOREIGN KEY (`working_permit_id`) REFERENCES `working_permit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit_remarks` ADD CONSTRAINT `working_permit_remarks_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
