-- CreateTable
CREATE TABLE `working_permit` (
    `id` VARCHAR(36) NOT NULL,
    `reference_number` VARCHAR(30) NOT NULL,
    `request_to` VARCHAR(100) NOT NULL,
    `from` VARCHAR(100) NOT NULL,
    `request_level` ENUM('LEVEL_1', 'LEVEL_2') NOT NULL,
    `date` DATE NOT NULL,
    `request_for` TEXT NOT NULL,
    `branch_department` VARCHAR(150) NOT NULL,
    `requested_by` VARCHAR(100) NOT NULL,
    `checked_by` VARCHAR(100) NULL,
    `attachment` VARCHAR(500) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `working_permit_reference_number_key`(`reference_number`),
    INDEX `working_permit_request_to_idx`(`request_to`),
    INDEX `working_permit_request_level_idx`(`request_level`),
    INDEX `working_permit_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
