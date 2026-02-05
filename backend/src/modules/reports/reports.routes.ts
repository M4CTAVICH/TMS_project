import { Router } from 'express';
import {
  getDashboardStats,
  getOrderAnalytics,
  getProductionAnalytics,
  getStockMovementReport,
} from './reports.controller';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.MANAGER)); // Only managers can access reports

router.get('/dashboard', getDashboardStats);
router.get('/orders', getOrderAnalytics);
router.get('/production', getProductionAnalytics);
router.get('/stock-movements', getStockMovementReport);

export default router;
