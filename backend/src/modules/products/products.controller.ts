import { Request, Response, NextFunction } from 'express';
import { ProductService } from './products.service';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/utils/response';

const productService = new ProductService();

export const createProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.createProduct(req.body);
    sendCreated(res, { product }, 'Product created successfully');
  }
);

export const getProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string | undefined;

    const result = await productService.getProducts(page, limit, type);
    sendSuccess(res, result.products, undefined, 200, result.meta);
  }
);

export const getProductById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.getProductById(req.params.id);
    sendSuccess(res, { product });
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    sendSuccess(res, { product }, 'Product updated successfully');
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await productService.deleteProduct(req.params.id);
    sendSuccess(res, result);
  }
);

export const getRawMaterials = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await productService.getRawMaterials(page, limit);
    sendSuccess(res, result.products, undefined, 200, result.meta);
  }
);

export const getFinishedProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await productService.getFinishedProducts(page, limit);
    sendSuccess(res, result.products, undefined, 200, result.meta);
  }
);
