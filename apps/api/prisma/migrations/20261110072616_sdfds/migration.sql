-- AlterTable
ALTER TABLE `department_branches` ADD COLUMN `checker_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `checker_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `department_branches` ADD CONSTRAINT `department_branches_checker_id_fkey` FOREIGN KEY (`checker_id`) REFERENCES `checker_list`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
