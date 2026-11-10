-- DropIndex
DROP INDEX `working_permit_request_level_idx` ON `working_permit`;

-- CreateIndex
CREATE INDEX `working_permit_branch_department_idx` ON `working_permit`(`branch_department`);
