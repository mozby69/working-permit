/*
  Warnings:

  - You are about to drop the column `approved_by` on the `worker_list` table. All the data in the column will be lost.
  - You are about to drop the column `final_approved_by` on the `worker_list` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `worker_list` DROP COLUMN `approved_by`,
    DROP COLUMN `final_approved_by`,
    ADD COLUMN `final_approver_user_id` INTEGER NULL,
    ADD COLUMN `first_approver_user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `worker_list` ADD CONSTRAINT `worker_list_first_approver_user_id_fkey` FOREIGN KEY (`first_approver_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_list` ADD CONSTRAINT `worker_list_final_approver_user_id_fkey` FOREIGN KEY (`final_approver_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
