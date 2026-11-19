-- AlterTable
ALTER TABLE `working_permit` ADD COLUMN `request_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `request_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `request_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
