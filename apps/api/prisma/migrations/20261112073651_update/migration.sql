/*
  Warnings:

  - You are about to drop the column `entity_name` on the `department_branches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `department_branches` DROP COLUMN `entity_name`,
    ADD COLUMN `entityName` VARCHAR(100) NULL;
