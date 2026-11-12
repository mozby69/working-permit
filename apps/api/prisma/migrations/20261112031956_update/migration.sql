-- AlterTable
ALTER TABLE `approval_table` ADD COLUMN `checked_status_at` DATETIME(3) NULL,
    ADD COLUMN `final_approver_approved_at` DATETIME(3) NULL,
    ADD COLUMN `first_approver_approved_at` DATETIME(3) NULL,
    ADD COLUMN `status_at` DATETIME(3) NULL;
