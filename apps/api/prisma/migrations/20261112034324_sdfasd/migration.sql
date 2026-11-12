/*
  Warnings:

  - You are about to drop the column `approver_final` on the `approval_table` table. All the data in the column will be lost.
  - You are about to drop the column `approver_first` on the `approval_table` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `approval_table` DROP COLUMN `approver_final`,
    DROP COLUMN `approver_first`,
    ADD COLUMN `approver_final_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `approver_first_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
