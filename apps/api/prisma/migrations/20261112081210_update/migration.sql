/*
  Warnings:

  - Made the column `entity_name` on table `department_branches` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `department_branches` MODIFY `entity_name` VARCHAR(100) NOT NULL;
