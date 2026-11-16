-- AlterTable
ALTER TABLE `users` ADD COLUMN `worker_list_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `users_worker_list_id_idx` ON `users`(`worker_list_id`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_worker_list_id_fkey` FOREIGN KEY (`worker_list_id`) REFERENCES `worker_list`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
