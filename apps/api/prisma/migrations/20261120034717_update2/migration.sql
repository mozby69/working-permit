-- AlterTable
ALTER TABLE `working_permit` ADD COLUMN `complete_by_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_complete_by_id_fkey` FOREIGN KEY (`complete_by_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
