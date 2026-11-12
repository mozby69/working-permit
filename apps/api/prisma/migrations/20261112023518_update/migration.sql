/*
  Warnings:

  - You are about to drop the column `approver_final` on the `working_permit` table. All the data in the column will be lost.
  - You are about to drop the column `approver_first` on the `working_permit` table. All the data in the column will be lost.
  - You are about to drop the column `checked_status` on the `working_permit` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `working_permit` table. All the data in the column will be lost.
  - You are about to drop the `checker_list` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `department_branches` DROP FOREIGN KEY `department_branches_checker_id_fkey`;

-- DropIndex
DROP INDEX `department_branches_checker_id_fkey` ON `department_branches`;

-- AlterTable
ALTER TABLE `working_permit` DROP COLUMN `approver_final`,
    DROP COLUMN `approver_first`,
    DROP COLUMN `checked_status`,
    DROP COLUMN `status`;

-- DropTable
DROP TABLE `checker_list`;

-- CreateTable
CREATE TABLE `approval_table` (
    `id` VARCHAR(36) NOT NULL,
    `working_permit_id` VARCHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `checked_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `approver_first` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `approver_final` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `department_branches` ADD CONSTRAINT `department_branches_checker_id_fkey` FOREIGN KEY (`checker_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_table` ADD CONSTRAINT `approval_table_working_permit_id_fkey` FOREIGN KEY (`working_permit_id`) REFERENCES `working_permit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
