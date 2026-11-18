-- CreateTable
CREATE TABLE `user_branch_assignments` (
    `user_id` INTEGER NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_branch_assignments_branch_id_idx`(`branch_id`),
    PRIMARY KEY (`user_id`, `branch_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_branch_assignments` ADD CONSTRAINT `user_branch_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_branch_assignments` ADD CONSTRAINT `user_branch_assignments_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `department_branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
