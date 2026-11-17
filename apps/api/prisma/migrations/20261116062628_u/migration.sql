/*
  Warnings:

  - A unique constraint covering the columns `[working_permit_id]` on the table `approval_table` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `approval_table` ADD COLUMN `received_at` DATETIME(3) NULL,
    ADD COLUMN `received_by_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `approval_table_working_permit_id_key` ON `approval_table`(`working_permit_id`);

-- AddForeignKey
ALTER TABLE `approval_table` ADD CONSTRAINT `approval_table_received_by_id_fkey` FOREIGN KEY (`received_by_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
