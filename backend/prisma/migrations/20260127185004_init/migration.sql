-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `role` ENUM('MANAGER', 'RAW_STOCK_MANAGER', 'PRODUCTION_CLIENT', 'DISTRIBUTOR', 'TRANSPORT_PROVIDER') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `locationType` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `locations_userId_key`(`userId`),
    INDEX `locations_locationType_idx`(`locationType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NOT NULL,
    `type` ENUM('RAW_MATERIAL', 'FINISHED_PRODUCT') NOT NULL,
    `unitWeight` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_sku_key`(`sku`),
    INDEX `products_type_idx`(`type`),
    INDEX `products_sku_idx`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raw_material_stock` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `reservedQty` DOUBLE NOT NULL DEFAULT 0,
    `availableQty` DOUBLE NOT NULL DEFAULT 0,
    `lastUpdated` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `raw_material_stock_locationId_idx`(`locationId`),
    UNIQUE INDEX `raw_material_stock_productId_locationId_key`(`productId`, `locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_stock` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `reservedQty` DOUBLE NOT NULL DEFAULT 0,
    `availableQty` DOUBLE NOT NULL DEFAULT 0,
    `lastUpdated` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `production_stock_locationId_idx`(`locationId`),
    UNIQUE INDEX `production_stock_productId_locationId_key`(`productId`, `locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finished_product_stock` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `reservedQty` DOUBLE NOT NULL DEFAULT 0,
    `availableQty` DOUBLE NOT NULL DEFAULT 0,
    `lastUpdated` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `finished_product_stock_locationId_idx`(`locationId`),
    UNIQUE INDEX `finished_product_stock_productId_locationId_key`(`productId`, `locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `type` ENUM('RAW_MATERIAL_ORDER', 'FINISHED_PRODUCT_ORDER') NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdById` VARCHAR(191) NOT NULL,
    `fromLocationId` VARCHAR(191) NOT NULL,
    `toLocationId` VARCHAR(191) NOT NULL,
    `productTotal` DOUBLE NOT NULL,
    `transportTotal` DOUBLE NOT NULL,
    `grandTotal` DOUBLE NOT NULL,
    `distanceKm` DOUBLE NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deliveryDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_orderNumber_key`(`orderNumber`),
    INDEX `orders_orderNumber_idx`(`orderNumber`),
    INDEX `orders_status_idx`(`status`),
    INDEX `orders_type_idx`(`type`),
    INDEX `orders_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_items_orderId_idx`(`orderId`),
    INDEX `order_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transport_providers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transport_providers_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `licensePlate` VARCHAR(191) NOT NULL,
    `capacityKg` DOUBLE NOT NULL,
    `costPerKm` DOUBLE NOT NULL,
    `status` ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicles_licensePlate_key`(`licensePlate`),
    INDEX `vehicles_providerId_idx`(`providerId`),
    INDEX `vehicles_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transport_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `fromLocationId` VARCHAR(191) NOT NULL,
    `toLocationId` VARCHAR(191) NOT NULL,
    `distanceKm` DOUBLE NOT NULL,
    `totalWeight` DOUBLE NOT NULL,
    `totalCost` DOUBLE NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `scheduledDate` DATETIME(3) NOT NULL,
    `completedDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transport_jobs_orderId_key`(`orderId`),
    INDEX `transport_jobs_orderId_idx`(`orderId`),
    INDEX `transport_jobs_providerId_idx`(`providerId`),
    INDEX `transport_jobs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_allocations` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `cost` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vehicle_allocations_jobId_idx`(`jobId`),
    INDEX `vehicle_allocations_vehicleId_idx`(`vehicleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipes` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe_inputs` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recipe_inputs_recipeId_idx`(`recipeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe_outputs` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recipe_outputs_recipeId_idx`(`recipeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_batches` (
    `id` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `producedById` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `multiplier` DOUBLE NOT NULL DEFAULT 1,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `production_batches_batchNumber_key`(`batchNumber`),
    INDEX `production_batches_batchNumber_idx`(`batchNumber`),
    INDEX `production_batches_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_inputs` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantityUsed` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `production_inputs_batchId_idx`(`batchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_outputs` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantityProduced` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `production_outputs_batchId_idx`(`batchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `payerId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` ENUM('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_MONEY') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `transactionRef` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_orderId_key`(`orderId`),
    UNIQUE INDEX `payments_transactionRef_key`(`transactionRef`),
    INDEX `payments_orderId_idx`(`orderId`),
    INDEX `payments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `locations` ADD CONSTRAINT `locations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raw_material_stock` ADD CONSTRAINT `raw_material_stock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raw_material_stock` ADD CONSTRAINT `raw_material_stock_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_stock` ADD CONSTRAINT `production_stock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_stock` ADD CONSTRAINT `production_stock_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finished_product_stock` ADD CONSTRAINT `finished_product_stock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finished_product_stock` ADD CONSTRAINT `finished_product_stock_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_fromLocationId_fkey` FOREIGN KEY (`fromLocationId`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_toLocationId_fkey` FOREIGN KEY (`toLocationId`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_providers` ADD CONSTRAINT `transport_providers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `transport_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_jobs` ADD CONSTRAINT `transport_jobs_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_jobs` ADD CONSTRAINT `transport_jobs_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `transport_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_jobs` ADD CONSTRAINT `transport_jobs_fromLocationId_fkey` FOREIGN KEY (`fromLocationId`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transport_jobs` ADD CONSTRAINT `transport_jobs_toLocationId_fkey` FOREIGN KEY (`toLocationId`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_allocations` ADD CONSTRAINT `vehicle_allocations_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `transport_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_allocations` ADD CONSTRAINT `vehicle_allocations_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_inputs` ADD CONSTRAINT `recipe_inputs_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_inputs` ADD CONSTRAINT `recipe_inputs_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_outputs` ADD CONSTRAINT `recipe_outputs_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_outputs` ADD CONSTRAINT `recipe_outputs_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_batches` ADD CONSTRAINT `production_batches_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_batches` ADD CONSTRAINT `production_batches_producedById_fkey` FOREIGN KEY (`producedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_inputs` ADD CONSTRAINT `production_inputs_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `production_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_inputs` ADD CONSTRAINT `production_inputs_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_outputs` ADD CONSTRAINT `production_outputs_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `production_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_outputs` ADD CONSTRAINT `production_outputs_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_payerId_fkey` FOREIGN KEY (`payerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
