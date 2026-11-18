-- Preserve existing approval state while normalizing to one row per stage.
-- IMPORTANT: back up the database before applying this migration.
-- The old one-row schema has a UNIQUE working_permit_id constraint.
ALTER TABLE `working_permit`
  ADD COLUMN `received_by_id` INTEGER NULL,
  ADD COLUMN `received_at` DATETIME(3) NULL;

ALTER TABLE `working_permit`
  ADD CONSTRAINT `working_permit_received_by_id_fkey`
  FOREIGN KEY (`received_by_id`) REFERENCES `users`(`user_id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE `working_permit` w
JOIN `approval_table` a ON a.`working_permit_id` = w.`id`
SET w.`received_by_id` = a.`received_by_id`,
    w.`received_at` = a.`received_at`;

ALTER TABLE `approval_table`
  ADD INDEX `approval_table_working_permit_id_idx` (`working_permit_id`),
  DROP INDEX `approval_table_working_permit_id_key`,
  ADD COLUMN `sequence` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `role` VARCHAR(40) NOT NULL DEFAULT 'CHECKER';

-- Add later stages before overwriting old aggregate fields.
INSERT INTO `approval_table` (`id`, `working_permit_id`, `sequence`, `role`, `status`, `status_at`, `created_at`)
SELECT UUID(), a.`working_permit_id`, 2, 'FIRST_APPROVER',
       a.`approver_first_status`, a.`first_approver_approved_at`, a.`created_at`
FROM `approval_table` a
JOIN `working_permit` w ON w.`id` = a.`working_permit_id`
WHERE w.`request_level` = 'LEVEL_2' AND a.`sequence` = 1;

INSERT INTO `approval_table` (`id`, `working_permit_id`, `sequence`, `role`, `status`, `status_at`, `created_at`)
SELECT UUID(), a.`working_permit_id`,
       CASE WHEN w.`request_level` = 'LEVEL_1' THEN 2 ELSE 3 END,
       'FINAL_APPROVER', a.`approver_final_status`,
       a.`final_approver_approved_at`, a.`created_at`
FROM `approval_table` a
JOIN `working_permit` w ON w.`id` = a.`working_permit_id`
WHERE a.`sequence` = 1;

INSERT INTO `approval_table` (`id`, `working_permit_id`, `sequence`, `role`, `status`, `status_at`, `created_at`)
SELECT UUID(), a.`working_permit_id`,
       CASE WHEN w.`request_level` = 'LEVEL_1' THEN 3 ELSE 4 END,
       'TROUBLESHOOTER', a.`status`, a.`status_at`, a.`created_at`
FROM `approval_table` a
JOIN `working_permit` w ON w.`id` = a.`working_permit_id`
WHERE a.`sequence` = 1;

UPDATE `approval_table` SET
  `status` = `checked_status`,
  `status_at` = `checked_status_at`,
  `role` = 'CHECKER'
WHERE `sequence` = 1;

ALTER TABLE `approval_table`
  DROP FOREIGN KEY `approval_table_received_by_id_fkey`;

ALTER TABLE `approval_table`
  DROP COLUMN `checked_status`,
  DROP COLUMN `approver_first_status`,
  DROP COLUMN `approver_final_status`,
  DROP COLUMN `checked_status_at`,
  DROP COLUMN `first_approver_approved_at`,
  DROP COLUMN `final_approver_approved_at`,
  DROP COLUMN `received_by_id`,
  DROP COLUMN `received_at`;

ALTER TABLE `working_permit`
  DROP COLUMN `sequence`;

ALTER TABLE `approval_table`
  ADD CONSTRAINT `approval_table_working_permit_id_sequence_key` UNIQUE (`working_permit_id`, `sequence`);
