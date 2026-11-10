/*
  Warnings:

  - You are about to drop the column `from` on the `working_permit` table. All the data in the column will be lost.
  - Added the required column `from_id` to the `working_permit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `working_permit` DROP COLUMN `from`,
    ADD COLUMN `from_id` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `working_permit_from_id_idx` ON `working_permit`(`from_id`);

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_from_id_fkey` FOREIGN KEY (`from_id`) REFERENCES `department_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
