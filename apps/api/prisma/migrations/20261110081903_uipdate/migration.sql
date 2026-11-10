-- CreateTable
CREATE TABLE `worker_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `worker_name` VARCHAR(100) NOT NULL,
    `approved_by` VARCHAR(100) NOT NULL,
    `final_approved_by` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
