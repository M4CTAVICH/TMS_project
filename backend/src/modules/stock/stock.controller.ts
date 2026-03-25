import { Response, NextFunction } from 'express';
import { StockService } from './stock.service';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth';
import prisma from '../../config/prisma';
import { UnauthorizedError } from '../../shared/errors/AppError';

const stockService = new StockService();

export const getRawMaterialStock = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    
    const locationId = req.query.locationId as string | undefined;
    const productId = req.query.productId as string | undefined;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, locationId: true },
    });

    const stock = await stockService.getRawMaterialStock(
      locationId,
      productId,
      req.user.id,
      user?.role as string,
      user?.locationId
    );
    sendSuccess(res, { stock });
  }
);

export const updateRawMaterialStock = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, locationId } = req.params;
    const stock = await stockService.updateRawMaterialStock(
      productId,
      locationId,
      req.body
    );
    sendSuccess(res, { stock }, 'Stock updated successfully');
  }
);

export const getProductionStock = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    
    const locationId = req.query.locationId as string | undefined;
    const productId = req.query.productId as string | undefined;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, locationId: true },
    });

    const stock = await stockService.getProductionStock(
      locationId,
      productId,
      req.user.id,
      user?.role as string,
      user?.locationId
    );
    sendSuccess(res, { stock });
  }
);

export const updateProductionStock = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, locationId } = req.params;
    const stock = await stockService.updateProductionStock(
      productId,
      locationId,
      req.body
    );
    sendSuccess(res, { stock }, 'Stock updated successfully');
  }
);

export const getFinishedProductStock = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    
    const locationId = req.query.locationId as string | undefined;
    const productId = req.query.productId as string | undefined;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, locationId: true },
    });

    const stock = await stockService.getFinishedProductStock(
      locationId,
      productId,
      req.user.id,
      user?.role as string,
      user?.locationId
    );
    sendSuccess(res, { stock });
  }
);

export const updateFinishedProductStock = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, locationId } = req.params;
    const stock = await stockService.updateFinishedProductStock(
      productId,
      locationId,
      req.body
    );
    sendSuccess(res, { stock }, 'Stock updated successfully');
  }
);

export const getStockOverview = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, locationId: true },
    });

    const overview = await stockService.getStockOverview(
      req.user.id,
      user?.role as string,
      user?.locationId
    );
    sendSuccess(res, overview);
  }
);

export const getAvailableProductsAtLocation = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { locationId } = req.params;
    const type = req.query.type as string | undefined;

    // Get user role and location if authenticated, otherwise use defaults
    let userRole: string | undefined;
    let userLocationId: string | null | undefined;
    
    if (req.user) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true, locationId: true },
      });
      userRole = user?.role;
      userLocationId = user?.locationId;
    }

    const products = await stockService.getAvailableProductsAtLocation(
      locationId,
      type as 'RAW_MATERIAL' | 'FINISHED_PRODUCT' | undefined,
      userRole,
      userLocationId
    );
    sendSuccess(res, { products });
  }
);
