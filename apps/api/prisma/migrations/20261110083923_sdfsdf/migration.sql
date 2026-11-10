/*
  Warnings:

  - You are about to drop the column `request_to` on the `working_permit` table. All the data in the column will be lost.
  - Added the required column `requestTo` to the `working_permit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `working_permit_request_to_idx` ON `working_permit`;

-- AlterTable
ALTER TABLE `working_permit` DROP COLUMN `request_to`,
    ADD COLUMN `requestTo` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `working_permit_requestTo_idx` ON `working_permit`(`requestTo`);

-- AddForeignKey
ALTER TABLE `working_permit` ADD CONSTRAINT `working_permit_requestTo_fkey` FOREIGN KEY (`requestTo`) REFERENCES `worker_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
