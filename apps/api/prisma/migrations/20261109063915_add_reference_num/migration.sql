-- CreateTable
CREATE TABLE `reference_counters` (
    `name` VARCHAR(50) NOT NULL,
    `last_value` INTEGER NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
