import prisma from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { generateOrderNumber } from '../../shared/utils/generators';
import { calculateDistance } from '../../shared/utils/distance';
import { TransportService } from '../transport/transport.service';

interface CreateOrderDTO {
  type: 'RAW_MATERIAL_ORDER' | 'FINISHED_PRODUCT_ORDER';
  createdById: string;
  fromLocationId: string;
  toLocationId: string;
  transportProviderId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export class OrderService {
  private transportService: TransportService;

  constructor() {
    this.transportService = new TransportService();
  }

 
  async createOrder(data: CreateOrderDTO) {
    const { type, createdById, fromLocationId, toLocationId, transportProviderId, items } = data;

    const [fromLocation, toLocation] = await Promise.all([
      prisma.location.findUnique({ where: { id: fromLocationId } }),
      prisma.location.findUnique({ where: { id: toLocationId } }),
    ]);

    if (!fromLocation || !toLocation) {
      throw new NotFoundError('One or both locations not found');
    }

    const distanceKm = calculateDistance(
      fromLocation.latitude,
      fromLocation.longitude,
      toLocation.latitude,
      toLocation.longitude
    );

    const order = await prisma.$transaction(async (tx) => {
      let totalWeight = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundError(`Product ${item.productId} not found`);
        }

        if (!product.isActive) {
          throw new BadRequestError(`Product ${product.name} is not active`);
        }

        if (type === 'RAW_MATERIAL_ORDER' && product.type !== 'RAW_MATERIAL') {
          throw new BadRequestError(
            `Product ${product.name} is not a raw material`
          );
        }

        if (type === 'FINISHED_PRODUCT_ORDER' && product.type !== 'FINISHED_PRODUCT') {
          throw new BadRequestError(
            `Product ${product.name} is not a finished product`
          );
        }

        totalWeight += product.unitWeight * item.quantity;
      }

      const transportCostData = await this.transportService.calculateTransportCost(
        transportProviderId,
        totalWeight,
        distanceKm
      );

      const transportTotal = transportCostData.totalCost;

      await this.checkAndReserveStock(tx, type, fromLocationId, items);

      const orderNumber = generateOrderNumber();

      const order = await tx.order.create({
        data: {
          orderNumber,
          type,
          createdById,
          fromLocationId,
          toLocationId,
          transportTotal,
          distanceKm: Math.round(distanceKm * 100) / 100,
          status: 'PENDING',
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      const transportJob = await tx.transportJob.create({
        data: {
          orderId: order.id,
          providerId: transportProviderId,
          fromLocationId,
          toLocationId,
          distanceKm: Math.round(distanceKm * 100) / 100,
          totalWeight,
          totalCost: transportTotal,
          status: 'SCHEDULED',
          scheduledDate: new Date(),
        },
      });

      await tx.vehicleAllocation.createMany({
        data: transportCostData.allocations.map((allocation) => ({
          jobId: transportJob.id,
          vehicleId: allocation.vehicleId,
          cost: allocation.cost,
        })),
      });

      for (const allocation of transportCostData.allocations) {
        await tx.vehicle.update({
          where: { id: allocation.vehicleId },
          data: { status: 'IN_USE' },
        });
      }

      return order;
    });

    return this.getOrderById(order.id);
  }

  private async checkAndReserveStock(
    tx: any,
    orderType: string,
    fromLocationId: string,
    items: Array<{ productId: string; quantity: number }>
  ) {
    const stockTable =
      orderType === 'RAW_MATERIAL_ORDER'
        ? 'rawMaterialStock'
        : 'finishedProductStock';

    for (const item of items) {
      const stock = await (tx[stockTable] as any).findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: fromLocationId,
          },
        },
      });

      if (!stock) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        throw new BadRequestError(
          `Product ${product?.name} not available at this location`
        );
      }

      const availableQty = stock.quantity - stock.reservedQty;

      if (availableQty < item.quantity) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        throw new BadRequestError(
          `Insufficient stock for ${product?.name}. Available: ${availableQty}, Requested: ${item.quantity}`
        );
      }

      await (tx[stockTable] as any).update({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: fromLocationId,
          },
        },
        data: {
          reservedQty: stock.reservedQty + item.quantity,
          availableQty: availableQty - item.quantity,
        },
      });
    }
  }

  async getOrders(userId?: string, status?: string, type?: string) {
  const where: any = {};

  if (userId) where.createdById = userId;
  if (status) where.status = status;
  if (type) where.type = type;

  const orders = await prisma.order.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      fromLocation: true,
      toLocation: true,
      items: {
        include: {
          product: true,
        },
      },
      transportJob: {
        include: {
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          allocations: {
            include: {
              vehicle: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform the response to include transportProvider at top level
  const transformedOrders = orders.map((order) => ({
    ...order,
    transportProvider: order.transportJob?.provider
      ? {
          id: order.transportJob.provider.id,
          name: order.transportJob.provider.name,
          email: order.transportJob.provider.user?.email || null,
          phone: null, // Not in schema
          companyName: order.transportJob.provider.name,
          userId: order.transportJob.provider.userId,
        }
      : null,
  }));

  return transformedOrders;
}

async getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      fromLocation: true,
      toLocation: true,
      items: {
        include: {
          product: true,
        },
      },
      transportJob: {
        include: {
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          fromLocation: true,
          toLocation: true,
          allocations: {
            include: {
              vehicle: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Transform the response to include transportProvider at top level
  return {
    ...order,
    transportProvider: order.transportJob?.provider
      ? {
          id: order.transportJob.provider.id,
          name: order.transportJob.provider.name,
          email: order.transportJob.provider.user?.email || null,
          phone: null, // Not in schema
          companyName: order.transportJob.provider.name,
          userId: order.transportJob.provider.userId,
        }
      : null,
  };
}

  async updateOrderStatus(id: string, status: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        transportJob: {
          include: {
            allocations: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await prisma.$transaction(async (tx) => {
      const data: any = { status };

      if (status === 'DELIVERED') {
        data.deliveryDate = new Date();

        await this.releaseAndDeductStock(
          tx,
          order.type,
          order.fromLocationId,
          order.toLocationId,
          order.items
        );

        if (order.transportJob) {
          for (const allocation of order.transportJob.allocations) {
            await tx.vehicle.update({
              where: { id: allocation.vehicleId },
              data: { status: 'AVAILABLE' },
            });
          }

          await tx.transportJob.update({
            where: { id: order.transportJob.id },
            data: {
              status: 'COMPLETED',
              completedDate: new Date(),
            },
          });
        }
      }

      if (status === 'CANCELLED') {
        await this.releaseReservedStock(
          tx,
          order.type,
          order.fromLocationId,
          order.items
        );

        if (order.transportJob) {
          for (const allocation of order.transportJob.allocations) {
            await tx.vehicle.update({
              where: { id: allocation.vehicleId },
              data: { status: 'AVAILABLE' },
            });
          }

          await tx.transportJob.update({
            where: { id: order.transportJob.id },
            data: { status: 'CANCELLED' },
          });
        }
      }

      if (status === 'IN_TRANSIT' && order.transportJob) {
        await tx.transportJob.update({
          where: { id: order.transportJob.id },
          data: { status: 'IN_PROGRESS' },
        });
      }

      await tx.order.update({
        where: { id },
        data,
      });
    });

    return this.getOrderById(id);
  }

  private async releaseAndDeductStock(
    tx: any,
    orderType: string,
    fromLocationId: string,
    toLocationId: string,
    items: any[]
  ) {
    const sourceStockTable =
      orderType === 'RAW_MATERIAL_ORDER'
        ? 'rawMaterialStock'
        : 'finishedProductStock';

    const destStockTable =
      orderType === 'RAW_MATERIAL_ORDER'
        ? 'productionStock'
        : 'finishedProductStock';

    for (const item of items) {
      const sourceStock = await (tx[sourceStockTable] as any).findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: fromLocationId,
          },
        },
      });

      await (tx[sourceStockTable] as any).update({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: fromLocationId,
          },
        },
        data: {
          quantity: sourceStock.quantity - item.quantity,
          reservedQty: sourceStock.reservedQty - item.quantity,
          availableQty: sourceStock.quantity - item.quantity - (sourceStock.reservedQty - item.quantity),
        },
      });

      let destStock = await (tx[destStockTable] as any).findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: toLocationId,
          },
        },
      });

      if (!destStock) {
        await (tx[destStockTable] as any).create({
          data: {
            productId: item.productId,
            locationId: toLocationId,
            quantity: item.quantity,
            reservedQty: 0,
            availableQty: item.quantity,
          },
        });
      } else {
        await (tx[destStockTable] as any).update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: toLocationId,
            },
          },
          data: {
            quantity: destStock.quantity + item.quantity,
            availableQty: destStock.quantity + item.quantity - destStock.reservedQty,
          },
        });
      }
    }
  }

  private async releaseReservedStock(
    tx: any,
    orderType: string,
    fromLocationId: string,
    items: any[]
  ) {
    const stockTable =
      orderType === 'RAW_MATERIAL_ORDER'
        ? 'rawMaterialStock'
        : 'finishedProductStock';

    for (const item of items) {
      const stock = await (tx[stockTable] as any).findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: fromLocationId,
          },
        },
      });

      if (stock) {
        await (tx[stockTable] as any).update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: fromLocationId,
            },
          },
          data: {
            reservedQty: stock.reservedQty - item.quantity,
            availableQty: stock.quantity - (stock.reservedQty - item.quantity),
          },
        });
      }
    }
  }

  async cancelOrder(id: string) {
    return this.updateOrderStatus(id, 'CANCELLED');
  }
}
