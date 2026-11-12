/*
  Warnings:

  - You are about to drop the column `entityName` on the `department_branches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `department_branches` DROP COLUMN `entityName`,
    ADD COLUMN `entity_name` VARCHAR(100) NULL;
