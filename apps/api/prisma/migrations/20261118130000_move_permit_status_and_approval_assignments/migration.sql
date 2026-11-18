-- Data-preserving conversion from the legacy single aggregate approval row.
-- Back up the database first. Required approvers must be assigned in
-- department_branches.checker_id and worker_list first/final approver fields.
-- Missing assignees cause migration failure instead of silently assigning a wrong user.

ALTER TABLE `working_permit`
  ADD COLUMN `status` ENUM('PENDING','APPROVED','REJECTED','COMPLETED','CANCELLED','IN_PROGRESS') NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `status_at` DATETIME(3) NULL,
  ADD COLUMN `received_by_id` INTEGER NULL,
  ADD COLUMN `received_at` DATETIME(3) NULL;

ALTER TABLE `working_permit`
  ADD CONSTRAINT `working_permit_received_by_id_fkey`
  FOREIGN KEY (`received_by_id`) REFERENCES `users`(`user_id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Move request status and receiver ownership out of approval_table.
UPDATE `working_permit` p
JOIN `approval_table` a ON a.`working_permit_id` = p.`id`
SET p.`status` = CASE
  WHEN a.`status` IN ('IN_PROGRESS','COMPLETED','CANCELLED','REJECTED')
    THEN a.`status`
  WHEN a.`approver_final_status` = 'APPROVED' THEN 'APPROVED'
  ELSE 'PENDING'
END,
p.`status_at` = CASE
  WHEN a.`status` IN ('IN_PROGRESS','COMPLETED','CANCELLED','REJECTED')
    THEN a.`status_at`
  WHEN a.`approver_final_status` = 'APPROVED'
    THEN a.`final_approver_approved_at`
  ELSE NULL
END,
p.`received_by_id` = a.`received_by_id`,
p.`received_at` = a.`received_at`;

-- Snapshot old approval statuses before transforming the rows.
CREATE TEMPORARY TABLE `migration_approval_snapshot` AS
SELECT a.`working_permit_id`, a.`checked_status`,
  a.`approver_first_status`, a.`approver_final_status`,
  a.`checked_status_at`, a.`first_approver_approved_at`,
  a.`final_approver_approved_at`, a.`created_at`,
  p.`request_level`, p.`from_id`, p.`requestTo`
FROM `approval_table` a
JOIN `working_permit` p ON p.`id` = a.`working_permit_id`;

-- Protect the foreign key when removing the old unique index.
CREATE INDEX `approval_table_working_permit_id_idx`
  ON `approval_table`(`working_permit_id`);

ALTER TABLE `approval_table`
  DROP INDEX `approval_table_working_permit_id_key`,
  ADD COLUMN `sequence` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `approver_id` INTEGER NULL,
  ADD COLUMN `role` VARCHAR(40) NOT NULL DEFAULT 'CHECKER',
  ADD COLUMN `approved_at` DATETIME(3) NULL;

-- Reuse the existing unique legacy row for sequence 1.
UPDATE `approval_table` a
JOIN `migration_approval_snapshot` s ON s.`working_permit_id` = a.`working_permit_id`
JOIN `department_branches` d ON d.`id` = s.`from_id`
SET a.`sequence` = 1,
    a.`role` = 'CHECKER',
    a.`approver_id` = d.`checker_id`,
    a.`approved_at` = CASE WHEN s.`checked_status` = 'APPROVED'
      THEN COALESCE(s.`checked_status_at`, a.`updated_at`, a.`created_at`)
      ELSE NULL END;

-- Level 2: sequence 2 is FIRST_APPROVER.
INSERT INTO `approval_table`
  (`id`, `working_permit_id`, `sequence`, `approver_id`, `role`, `approved_at`, `created_at`)
SELECT UUID(), s.`working_permit_id`, 2,
  w.`first_approver_user_id`, 'FIRST_APPROVER',
  CASE WHEN s.`approver_first_status` = 'APPROVED'
    THEN COALESCE(s.`first_approver_approved_at`, s.`created_at`) ELSE NULL END,
  s.`created_at`
FROM `migration_approval_snapshot` s
JOIN `worker_list` w ON w.`id` = s.`requestTo`
WHERE s.`request_level` = 'LEVEL_2';

-- Level 1: FINAL_APPROVER sequence 2; Level 2: sequence 3.
INSERT INTO `approval_table`
  (`id`, `working_permit_id`, `sequence`, `approver_id`, `role`, `approved_at`, `created_at`)
SELECT UUID(), s.`working_permit_id`,
  CASE WHEN s.`request_level` = 'LEVEL_1' THEN 2 ELSE 3 END,
  w.`final_approver_user_id`, 'FINAL_APPROVER',
  CASE WHEN s.`approver_final_status` = 'APPROVED'
    THEN COALESCE(s.`final_approver_approved_at`, s.`created_at`) ELSE NULL END,
  s.`created_at`
FROM `migration_approval_snapshot` s
JOIN `worker_list` w ON w.`id` = s.`requestTo`;

DROP TEMPORARY TABLE `migration_approval_snapshot`;

-- Enforce assignees and per-permit sequence uniqueness.
-- Failure here indicates legacy requests with missing assigned users.
ALTER TABLE `approval_table`
  MODIFY `approver_id` INTEGER NOT NULL,
  ADD CONSTRAINT `approval_table_working_permit_id_sequence_key`
    UNIQUE (`working_permit_id`, `sequence`),
  ADD INDEX `approval_table_approver_id_idx` (`approver_id`);

ALTER TABLE `approval_table`
  ADD CONSTRAINT `approval_table_approver_id_fkey`
  FOREIGN KEY (`approver_id`) REFERENCES `users`(`user_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `approval_table`
  DROP FOREIGN KEY `approval_table_received_by_id_fkey`;

ALTER TABLE `approval_table`
  DROP COLUMN `status`,
  DROP COLUMN `checked_status`,
  DROP COLUMN `approver_first_status`,
  DROP COLUMN `approver_final_status`,
  DROP COLUMN `received_by_id`,
  DROP COLUMN `received_at`,
  DROP COLUMN `status_at`,
  DROP COLUMN `checked_status_at`,
  DROP COLUMN `first_approver_approved_at`,
  DROP COLUMN `final_approver_approved_at`;

ALTER TABLE `working_permit` DROP COLUMN `sequence`;
