import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  calculateDistance,
} from './locations.controller';
import { validate } from '../../shared/middleware/validator';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.MANAGER),
  [
    body('name').notEmpty().withMessage('Location name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
    body('locationType').notEmpty().withMessage('Location type is required'),
    validate,
  ],
  createLocation
);

router.get('/', getLocations);

router.get(
  '/calculate-distance',
  [
    query('fromLocationId').notEmpty().withMessage('From location ID is required'),
    query('toLocationId').notEmpty().withMessage('To location ID is required'),
    validate,
  ],
  calculateDistance
);

router.get('/:id', getLocationById);

router.put(
  '/:id',
  authorize(ROLES.MANAGER),
  [
    body('name').optional().notEmpty(),
    body('address').optional().notEmpty(),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('locationType').optional().notEmpty(),
    validate,
  ],
  updateLocation
);

router.delete('/:id', authorize(ROLES.MANAGER), deleteLocation);

export default router;
