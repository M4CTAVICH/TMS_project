import { Router } from 'express';
import { body } from 'express-validator';
import {
  getRawMaterialStock,
  updateRawMaterialStock,
  getProductionStock,
  updateProductionStock,
  getFinishedProductStock,
  updateFinishedProductStock,
  getStockOverview,
  getAvailableProductsAtLocation,
} from './stock.controller';
import { validate } from '../../shared/middleware/validator';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { ROLES } from '../../config/constants';

const router = Router();

// Public endpoint for getting available products at a location
router.get('/location/:locationId/available-products', getAvailableProductsAtLocation);

router.use(authenticate);

router.get('/overview', authorize(ROLES.MANAGER), getStockOverview);

router.get('/raw-material', getRawMaterialStock);
router.put(
  '/raw-material/:productId/:locationId',
  authorize(ROLES.MANAGER, ROLES.RAW_STOCK_MANAGER),
  [
    body('quantity')
      .isFloat({ min: 0 })
      .withMessage('Quantity must be 0 or greater'),
    body('operation')
      .isIn(['ADD', 'REMOVE', 'SET'])
      .withMessage('Valid operation is required'),
    validate,
  ],
  updateRawMaterialStock
);

router.get('/production', getProductionStock);
router.put(
  '/production/:productId/:locationId',
  authorize(ROLES.MANAGER, ROLES.PRODUCTION_CLIENT),
  [
    body('quantity')
      .isFloat({ min: 0 })
      .withMessage('Quantity must be 0 or greater'),
    body('operation')
      .isIn(['ADD', 'REMOVE', 'SET'])
      .withMessage('Valid operation is required'),
    validate,
  ],
  updateProductionStock
);

router.get('/finished-product', getFinishedProductStock);
router.put(
  '/finished-product/:productId/:locationId',
  authorize(ROLES.MANAGER),
  [
    body('quantity')
      .isFloat({ min: 0 })
      .withMessage('Quantity must be 0 or greater'),
    body('operation')
      .isIn(['ADD', 'REMOVE', 'SET'])
      .withMessage('Valid operation is required'),
    validate,
  ],
  updateFinishedProductStock
);

// Get available products at a location for order creation
router.get('/location/:locationId/available-products', getAvailableProductsAtLocation);

export default router;
