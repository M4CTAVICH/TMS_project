import prisma from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { MIN_STOCK_QUANTITY } from '../../config/constants';

interface UpdateStockDTO {
  quantity: number;
  operation: 'ADD' | 'REMOVE' | 'SET';
}

export class StockService {
  
  async getRawMaterialStock(
    locationId?: string,
    productId?: string,
    userId?: string,
    userRole?: string,
    userLocationId?: string | null
  ) {
    const where: any = {};
    
    // Location-based filtering for non-MANAGER roles
    if (userRole && userRole !== 'MANAGER') {
      if (userLocationId) {
        where.locationId = userLocationId;
      } else {
        return []; // User has no assigned location
      }
    } else if (locationId) {
      // MANAGER can filter by specific location if provided
      where.locationId = locationId;
    }
    
    if (productId) where.productId = productId;

    const stock = await prisma.rawMaterialStock.findMany({
      where,
      include: {
        product: true,
        location: true,
      },
      orderBy: { lastUpdated: 'desc' },
    });

    return stock.map(item => ({
      ...item,
      availableQty: item.quantity - item.reservedQty,
    }));
  }

  async updateRawMaterialStock(
    productId: string,
    locationId: string,
    data: UpdateStockDTO
  ) {
    const { quantity, operation } = data;

    if (quantity < 0) {
      throw new BadRequestError('Quantity cannot be negative');
    }

    let stock = await prisma.rawMaterialStock.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
    });

    if (!stock) {
      stock = await prisma.rawMaterialStock.create({
        data: {
          productId,
          locationId,
          quantity: 0,
          reservedQty: 0,
          availableQty: 0,
        },
      });
    }

    let newQuantity = stock.quantity;

    switch (operation) {
      case 'ADD':
        newQuantity += quantity;
        break;
      case 'REMOVE':
        newQuantity -= quantity;
        if (newQuantity < MIN_STOCK_QUANTITY) {
          throw new BadRequestError('Insufficient stock');
        }
        break;
      case 'SET':
        newQuantity = quantity;
        break;
    }

    const updatedStock = await prisma.rawMaterialStock.update({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
      data: {
        quantity: newQuantity,
        availableQty: newQuantity - stock.reservedQty,
      },
      include: {
        product: true,
        location: true,
      },
    });

    return updatedStock;
  }


  async getProductionStock(
    locationId?: string,
    productId?: string,
    userId?: string,
    userRole?: string,
    userLocationId?: string | null
  ) {
    const where: any = {};
    
    // Location-based filtering for non-MANAGER roles
    if (userRole && userRole !== 'MANAGER') {
      if (userLocationId) {
        where.locationId = userLocationId;
      } else {
        return []; // User has no assigned location
      }
    } else if (locationId) {
      // MANAGER can filter by specific location if provided
      where.locationId = locationId;
    }
    
    if (productId) where.productId = productId;

    const stock = await prisma.productionStock.findMany({
      where,
      include: {
        product: true,
        location: true,
      },
      orderBy: { lastUpdated: 'desc' },
    });

    return stock.map(item => ({
      ...item,
      availableQty: item.quantity - item.reservedQty,
    }));
  }

  async updateProductionStock(
    productId: string,
    locationId: string,
    data: UpdateStockDTO
  ) {
    const { quantity, operation } = data;

    if (quantity < 0) {
      throw new BadRequestError('Quantity cannot be negative');
    }

    let stock = await prisma.productionStock.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
    });

    if (!stock) {
      stock = await prisma.productionStock.create({
        data: {
          productId,
          locationId,
          quantity: 0,
          reservedQty: 0,
          availableQty: 0,
        },
      });
    }

    let newQuantity = stock.quantity;

    switch (operation) {
      case 'ADD':
        newQuantity += quantity;
        break;
      case 'REMOVE':
        newQuantity -= quantity;
        if (newQuantity < MIN_STOCK_QUANTITY) {
          throw new BadRequestError('Insufficient stock');
        }
        break;
      case 'SET':
        newQuantity = quantity;
        break;
    }

    const updatedStock = await prisma.productionStock.update({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
      data: {
        quantity: newQuantity,
        availableQty: newQuantity - stock.reservedQty,
      },
      include: {
        product: true,
        location: true,
      },
    });

    return updatedStock;
  }
  

  async getFinishedProductStock(
    locationId?: string,
    productId?: string,
    userId?: string,
    userRole?: string,
    userLocationId?: string | null
  ) {
    const where: any = {};
    
    // Location-based filtering for non-MANAGER roles
    if (userRole && userRole !== 'MANAGER') {
      if (userLocationId) {
        where.locationId = userLocationId;
      } else {
        return []; // User has no assigned location
      }
    } else if (locationId) {
      // MANAGER can filter by specific location if provided
      where.locationId = locationId;
    }
    
    if (productId) where.productId = productId;

    const stock = await prisma.finishedProductStock.findMany({
      where,
      include: {
        product: true,
        location: true,
      },
      orderBy: { lastUpdated: 'desc' },
    });

    return stock.map(item => ({
      ...item,
      availableQty: item.quantity - item.reservedQty,
    }));
  }

  async updateFinishedProductStock(
    productId: string,
    locationId: string,
    data: UpdateStockDTO
  ) {
    const { quantity, operation } = data;

    if (quantity < 0) {
      throw new BadRequestError('Quantity cannot be negative');
    }

    let stock = await prisma.finishedProductStock.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
    });

    if (!stock) {
      stock = await prisma.finishedProductStock.create({
        data: {
          productId,
          locationId,
          quantity: 0,
          reservedQty: 0,
          availableQty: 0,
        },
      });
    }

    let newQuantity = stock.quantity;

    switch (operation) {
      case 'ADD':
        newQuantity += quantity;
        break;
      case 'REMOVE':
        newQuantity -= quantity;
        if (newQuantity < MIN_STOCK_QUANTITY) {
          throw new BadRequestError('Insufficient stock');
        }
        break;
      case 'SET':
        newQuantity = quantity;
        break;
    }

    const updatedStock = await prisma.finishedProductStock.update({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
      data: {
        quantity: newQuantity,
        availableQty: newQuantity - stock.reservedQty,
      },
      include: {
        product: true,
        location: true,
      },
    });

    return updatedStock;
  }


  async getStockOverview(userId?: string, userRole?: string, userLocationId?: string | null) {
    const whereClause: any = {};
    
    // Location-based filtering for non-MANAGER roles
    if (userRole && userRole !== 'MANAGER') {
      if (userLocationId) {
        whereClause.locationId = userLocationId;
      } else {
        return {
          rawMaterial: { totalQuantity: 0, totalReserved: 0, totalAvailable: 0, itemCount: 0 },
          production: { totalQuantity: 0, totalReserved: 0, totalAvailable: 0, itemCount: 0 },
          finishedProduct: { totalQuantity: 0, totalReserved: 0, totalAvailable: 0, itemCount: 0 },
        };
      }
    }

    const [rawStock, productionStock, finishedStock] = await Promise.all([
      prisma.rawMaterialStock.aggregate({
        _sum: { quantity: true, reservedQty: true },
        _count: true,
        where: whereClause,
      }),
      prisma.productionStock.aggregate({
        _sum: { quantity: true, reservedQty: true },
        _count: true,
        where: whereClause,
      }),
      prisma.finishedProductStock.aggregate({
        _sum: { quantity: true, reservedQty: true },
        _count: true,
        where: whereClause,
      }),
    ]);

    return {
      rawMaterial: {
        totalQuantity: rawStock._sum.quantity || 0,
        totalReserved: rawStock._sum.reservedQty || 0,
        totalAvailable: (rawStock._sum.quantity || 0) - (rawStock._sum.reservedQty || 0),
        itemCount: rawStock._count,
      },
      production: {
        totalQuantity: productionStock._sum.quantity || 0,
        totalReserved: productionStock._sum.reservedQty || 0,
        totalAvailable:
          (productionStock._sum.quantity || 0) - (productionStock._sum.reservedQty || 0),
        itemCount: productionStock._count,
      },
      finishedProduct: {
        totalQuantity: finishedStock._sum.quantity || 0,
        totalReserved: finishedStock._sum.reservedQty || 0,
        totalAvailable:
          (finishedStock._sum.quantity || 0) - (finishedStock._sum.reservedQty || 0),
        itemCount: finishedStock._count,
      },
    };
  }

  async getAvailableProductsAtLocation(
    locationId: string,
    productType?: 'RAW_MATERIAL' | 'FINISHED_PRODUCT',
    userRole?: string,
    userLocationId?: string | null
  ) {
    // Note: No location access restrictions here - users can see products from any location
    // when ordering. The confirming user selection (from fromLocation) is validated in the
    // order service.

    // Determine which stock table to query based on product type
    let result = [];

    if (!productType || productType === 'RAW_MATERIAL') {
      const rawStock = await prisma.rawMaterialStock.findMany({
        where: {
          locationId,
          quantity: { gt: 0 },
        },
        include: {
          product: true,
        },
      });

      result.push(
        ...rawStock
          .filter((item) => item.product && item.product.isActive && item.product.type === 'RAW_MATERIAL')
          .map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            productType: item.product.type,
            quantity: item.quantity,
            reservedQty: item.reservedQty,
            availableQty: item.quantity - item.reservedQty,
            unitWeight: item.product.unitWeight,
          }))
      );
    }

    if (!productType || productType === 'RAW_MATERIAL') {
      const productionRawStock = await prisma.productionStock.findMany({
        where: {
          locationId,
          quantity: { gt: 0 },
        },
        include: {
          product: true,
        },
      });

      result.push(
        ...productionRawStock
          .filter((item) => item.product && item.product.isActive && item.product.type === 'RAW_MATERIAL')
          .map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            productType: item.product.type,
            quantity: item.quantity,
            reservedQty: item.reservedQty,
            availableQty: item.quantity - item.reservedQty,
            unitWeight: item.product.unitWeight,
          }))
      );
    }

    if (!productType || productType === 'FINISHED_PRODUCT') {
      const finishedStock = await prisma.finishedProductStock.findMany({
        where: {
          locationId,
          quantity: { gt: 0 },
        },
        include: {
          product: true,
        },
      });

      result.push(
        ...finishedStock
          .filter((item) => item.product && item.product.isActive && item.product.type === 'FINISHED_PRODUCT')
          .map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            productType: item.product.type,
            quantity: item.quantity,
            reservedQty: item.reservedQty,
            availableQty: item.quantity - item.reservedQty,
            unitWeight: item.product.unitWeight,
          }))
      );
    }

    if (!productType || productType === 'FINISHED_PRODUCT') {
      const productionFinishedStock = await prisma.productionStock.findMany({
        where: {
          locationId,
          quantity: { gt: 0 },
        },
        include: {
          product: true,
        },
      });

      result.push(
        ...productionFinishedStock
          .filter((item) => item.product && item.product.isActive && item.product.type === 'FINISHED_PRODUCT')
          .map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            productType: item.product.type,
            quantity: item.quantity,
            reservedQty: item.reservedQty,
            availableQty: item.quantity - item.reservedQty,
            unitWeight: item.product.unitWeight,
          }))
      );
    }

    // Remove duplicates (same product in multiple stock tables) and sort
    const uniqueProducts = Array.from(
      new Map(result.map((item) => [item.productId, item])).values()
    );

    return uniqueProducts.sort((a, b) => a.productName.localeCompare(b.productName));
  }
}
