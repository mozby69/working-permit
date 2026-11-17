/*
  Warnings:

  - Added the required column `created_by_id` to the `working_permit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `working_permit` ADD COLUMN `created_by_id` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `working_permit_created_by_id_idx` ON `working_permit`(`created_by_id`);

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
