import { Request, Response, NextFunction } from 'express';
import { StockService } from './stock.service';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';

const stockService = new StockService();

export const getRawMaterialStock = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const locationId = req.query.locationId as string | undefined;
    const productId = req.query.productId as string | undefined;

    const stock = await stockService.getRawMaterialStock(locationId, productId);
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
  async (req: Request, res: Response, next: NextFunction) => {
    const locationId = req.query.locationId as string | undefined;
    const productId = req.query.productId as string | undefined;

    const stock = await stockService.getProductionStock(locationId, productId);
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
  async (req: Request, res: Response, next: NextFunction) => {
    const locationId = req.query.locationId as string | undefined;
    const productId = req.query.productId as string | undefined;

    const stock = await stockService.getFinishedProductStock(locationId, productId);
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
  async (req: Request, res: Response, next: NextFunction) => {
    const overview = await stockService.getStockOverview();
    sendSuccess(res, overview);
  }
);
