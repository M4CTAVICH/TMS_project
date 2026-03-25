/*
  Warnings:

  - You are about to drop the column `userId` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `grandTotal` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `productTotal` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orderId,productId]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `locations` DROP FOREIGN KEY `locations_userId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_payerId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_receiverId_fkey`;

-- DropIndex
DROP INDEX `locations_userId_key` ON `locations`;

-- AlterTable
ALTER TABLE `locations` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `order_items` DROP COLUMN `totalPrice`,
    DROP COLUMN `unitPrice`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `grandTotal`,
    DROP COLUMN `productTotal`,
    ADD COLUMN `confirmingUserId` VARCHAR(191) NULL,
    MODIFY `transportTotal` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `unitPrice`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `locationId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `payments`;

-- CreateIndex
CREATE UNIQUE INDEX `order_items_orderId_productId_key` ON `order_items`(`orderId`, `productId`);

-- CreateIndex
CREATE INDEX `orders_confirmingUserId_idx` ON `orders`(`confirmingUserId`);

-- CreateIndex
CREATE INDEX `users_locationId_idx` ON `users`(`locationId`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_confirmingUserId_fkey` FOREIGN KEY (`confirmingUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
