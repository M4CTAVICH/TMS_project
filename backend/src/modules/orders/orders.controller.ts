import { Request, Response, NextFunction } from 'express';
import { OrderService } from './orders.service';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth';

const orderService = new OrderService();

export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const data = {
      ...req.body,
      createdById: req.user!.id,
    };

    const order = await orderService.createOrder(data);
    sendCreated(res, { order }, 'Order created successfully');
  }
);

export const getOrders = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.query.userId as string | undefined;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const effectiveUserId =
      req.user!.role === 'MANAGER' ? userId : req.user!.id;

    const orders = await orderService.getOrders(effectiveUserId, status, type);
    sendSuccess(res, { orders });
  }
);

export const getOrderById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await orderService.getOrderById(req.params.id);
    sendSuccess(res, { order });
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    sendSuccess(res, { order }, 'Order status updated successfully');
  }
);

export const cancelOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const order = await orderService.cancelOrder(req.params.id);
    sendSuccess(res, { order }, 'Order cancelled successfully');
  }
);
