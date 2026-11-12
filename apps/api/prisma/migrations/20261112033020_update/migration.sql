/*
  Warnings:

  - A unique constraint covering the columns `[index_num]` on the table `approval_table` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `index_num` to the `approval_table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- AlterTable
ALTER TABLE `approval_table`
ADD COLUMN `index_num` INTEGER NOT NULL AUTO_INCREMENT,
ADD UNIQUE INDEX `approval_table_index_num_key` (`index_num`);
