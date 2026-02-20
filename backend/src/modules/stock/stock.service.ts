import prisma from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { MIN_STOCK_QUANTITY } from '../../config/constants';

interface UpdateStockDTO {
  quantity: number;
  operation: 'ADD' | 'REMOVE' | 'SET';
}

export class StockService {
  
  async getRawMaterialStock(locationId?: string, productId?: string) {
    const where: any = {};
    if (locationId) where.locationId = locationId;
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


  async getProductionStock(locationId?: string, productId?: string) {
    const where: any = {};
    if (locationId) where.locationId = locationId;
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
  

  async getFinishedProductStock(locationId?: string, productId?: string) {
    const where: any = {};
    if (locationId) where.locationId = locationId;
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


  async getStockOverview() {
    const [rawStock, productionStock, finishedStock] = await Promise.all([
      prisma.rawMaterialStock.aggregate({
        _sum: { quantity: true, reservedQty: true },
        _count: true,
      }),
      prisma.productionStock.aggregate({
        _sum: { quantity: true, reservedQty: true },
        _count: true,
      }),
      prisma.finishedProductStock.aggregate({
        _sum: { quantity: true, reservedQty: true },
        _count: true,
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
}
