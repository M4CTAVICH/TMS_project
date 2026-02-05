import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProvider,
  getProviders,
  getProviderById,
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  calculateTransportCost,
  getTransportJobs,
  getTransportJobById,
  updateTransportJobStatus,
} from './transport.controller';
import { validate } from '../../shared/middleware/validator';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate);

// Providers
router.post(
  '/providers',
  authorize(ROLES.MANAGER),
  [
    body('name').notEmpty().withMessage('Provider name is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
    validate,
  ],
  createProvider
);

router.get('/providers', getProviders);
router.get('/providers/:id', getProviderById);

// Vehicles
router.post(
  '/vehicles',
  authorize(ROLES.MANAGER, ROLES.TRANSPORT_PROVIDER),
  [
    body('providerId').notEmpty().withMessage('Provider ID is required'),
    body('name').notEmpty().withMessage('Vehicle name is required'),
    body('licensePlate').notEmpty().withMessage('License plate is required'),
    body('capacityKg')
      .isFloat({ min: 0.01 })
      .withMessage('Capacity must be greater than 0'),
    body('costPerKm')
      .isFloat({ min: 0 })
      .withMessage('Cost per km must be 0 or greater'),
    validate,
  ],
  createVehicle
);

router.get('/vehicles', getVehicles);
router.get('/vehicles/:id', getVehicleById);

router.put(
  '/vehicles/:id',
  authorize(ROLES.MANAGER, ROLES.TRANSPORT_PROVIDER),
  [
    body('name').optional().notEmpty(),
    body('capacityKg').optional().isFloat({ min: 0.01 }),
    body('costPerKm').optional().isFloat({ min: 0 }),
    body('status')
      .optional()
      .isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'INACTIVE']),
    validate,
  ],
  updateVehicle
);

// Cost Calculation
router.post(
  '/calculate-cost',
  [
    body('providerId').notEmpty().withMessage('Provider ID is required'),
    body('totalWeight')
      .isFloat({ min: 0.01 })
      .withMessage('Total weight must be greater than 0'),
    body('distanceKm')
      .isFloat({ min: 0.01 })
      .withMessage('Distance must be greater than 0'),
    validate,
  ],
  calculateTransportCost
);

// Transport Jobs
router.get('/jobs', getTransportJobs);
router.get('/jobs/:id', getTransportJobById);

router.put(
  '/jobs/:id/status',
  authorize(ROLES.MANAGER, ROLES.TRANSPORT_PROVIDER),
  [
    body('status')
      .isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
      .withMessage('Valid status is required'),
    validate,
  ],
  updateTransportJobStatus
);

export default router;
