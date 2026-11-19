/*
  Warnings:

  - You are about to drop the column `request_id` on the `working_permit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `working_permit` DROP FOREIGN KEY `working_permit_request_id_fkey`;

-- DropIndex
DROP INDEX `working_permit_request_id_fkey` ON `working_permit`;

-- AlterTable
ALTER TABLE `working_permit` DROP COLUMN `request_id`,
    ADD COLUMN `request_type_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_request_type_id_fkey` FOREIGN KEY (`request_type_id`) REFERENCES `request_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
