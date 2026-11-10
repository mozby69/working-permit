/*
  Warnings:

  - You are about to drop the column `branch_department` on the `working_permit` table. All the data in the column will be lost.
  - Added the required column `branch_dep_id` to the `working_permit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `working_permit_branch_department_idx` ON `working_permit`;

-- AlterTable
ALTER TABLE `department_branches` ADD COLUMN `isBranch` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `working_permit` DROP COLUMN `branch_department`,
    ADD COLUMN `branch_dep_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_branch_dep_id_fkey` FOREIGN KEY (`branch_dep_id`) REFERENCES `department_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
