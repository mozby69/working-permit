/*
  Warnings:

  - You are about to drop the column `attachment` on the `working_permit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `working_permit` DROP COLUMN `attachment`;

-- CreateTable
CREATE TABLE `working_permit_attachments` (
    `id` VARCHAR(36) NOT NULL,
    `working_permit_id` VARCHAR(36) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `stored_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(150) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `working_permit_attachments_working_permit_id_idx`(`working_permit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `working_permit_attachments` ADD CONSTRAINT `working_permit_attachments_working_permit_id_fkey` FOREIGN KEY (`working_permit_id`) REFERENCES `working_permit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
