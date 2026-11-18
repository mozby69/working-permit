-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `worker_list_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_worker_list_id_idx`(`worker_list_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_role_name_key`(`role_name`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `user_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_roles_role_id_idx`(`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `permission_id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permissions_code_key`(`code`),
    UNIQUE INDEX `permissions_name_key`(`name`),
    PRIMARY KEY (`permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `working_permit` (
    `id` VARCHAR(36) NOT NULL,
    `reference_number` VARCHAR(30) NOT NULL,
    `request_level` ENUM('LEVEL_1', 'LEVEL_2') NOT NULL,
    `date` DATE NOT NULL,
    `request_for` TEXT NOT NULL,
    `requested_by` VARCHAR(100) NOT NULL,
    `checked_by` VARCHAR(100) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS') NOT NULL DEFAULT 'PENDING',
    `status_at` DATETIME(3) NULL,
    `received_by_id` INTEGER NULL,
    `received_at` DATETIME(3) NULL,
    `from_id` INTEGER NOT NULL,
    `branch_dep_id` INTEGER NOT NULL,
    `requestTo` INTEGER NOT NULL,
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `working_permit_reference_number_key`(`reference_number`),
    INDEX `working_permit_requestTo_idx`(`requestTo`),
    INDEX `working_permit_date_idx`(`date`),
    INDEX `working_permit_from_id_idx`(`from_id`),
    INDEX `working_permit_created_by_id_idx`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reference_counters` (
    `name` VARCHAR(50) NOT NULL,
    `last_value` INTEGER NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department_branches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entity_name` VARCHAR(100) NOT NULL,
    `checker_id` INTEGER NULL,
    `isBranch` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `worker_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `worker_name` VARCHAR(100) NOT NULL,
    `first_approver_user_id` INTEGER NULL,
    `final_approver_user_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_table` (
    `id` VARCHAR(36) NOT NULL,
    `index_num` INTEGER NOT NULL AUTO_INCREMENT,
    `working_permit_id` VARCHAR(36) NOT NULL,
    `sequence` INTEGER NOT NULL,
    `approver_id` INTEGER NOT NULL,
    `role` VARCHAR(40) NOT NULL,
    `approved_at` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `approval_table_index_num_key`(`index_num`),
    INDEX `approval_table_approver_id_idx`(`approver_id`),
    UNIQUE INDEX `approval_table_working_permit_id_sequence_key`(`working_permit_id`, `sequence`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `working_permit_attachments` (
    `id` VARCHAR(36) NOT NULL,
    `working_permit_id` VARCHAR(36) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `stored_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(150) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `working_permit_attachments_working_permit_id_idx`(`working_permit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `working_permit_remarks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `working_permit_id` VARCHAR(36) NOT NULL,
    `description` TEXT NOT NULL,
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `working_permit_remarks_working_permit_id_created_at_idx`(`working_permit_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_worker_list_id_fkey` FOREIGN KEY (`worker_list_id`) REFERENCES `worker_list`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_received_by_id_fkey` FOREIGN KEY (`received_by_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `department_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_branch_dep_id_fkey` FOREIGN KEY (`branch_dep_id`) REFERENCES `department_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_requestTo_fkey` FOREIGN KEY (`requestTo`) REFERENCES `worker_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `department_branches` ADD CONSTRAINT `department_branches_checker_id_fkey` FOREIGN KEY (`checker_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_list` ADD CONSTRAINT `worker_list_first_approver_user_id_fkey` FOREIGN KEY (`first_approver_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `worker_list` ADD CONSTRAINT `worker_list_final_approver_user_id_fkey` FOREIGN KEY (`final_approver_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_table` ADD CONSTRAINT `approval_table_working_permit_id_fkey` FOREIGN KEY (`working_permit_id`) REFERENCES `working_permit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_table` ADD CONSTRAINT `approval_table_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit_attachments` ADD CONSTRAINT `working_permit_attachments_working_permit_id_fkey` FOREIGN KEY (`working_permit_id`) REFERENCES `working_permit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit_remarks` ADD CONSTRAINT `working_permit_remarks_working_permit_id_fkey` FOREIGN KEY (`working_permit_id`) REFERENCES `working_permit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_permit_remarks` ADD CONSTRAINT `working_permit_remarks_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
