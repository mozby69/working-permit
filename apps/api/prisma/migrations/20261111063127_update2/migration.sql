/*
  Warnings:

  - You are about to drop the column `CheckedStatus` on the `working_permit` table. All the data in the column will be lost.
  - You are about to drop the column `approvedFinalApprover` on the `working_permit` table. All the data in the column will be lost.
  - You are about to drop the column `approvedFirstApprover` on the `working_permit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `working_permit` DROP COLUMN `CheckedStatus`,
    DROP COLUMN `approvedFinalApprover`,
    DROP COLUMN `approvedFirstApprover`,
    ADD COLUMN `approver_final` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `approver_first` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `checked_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
