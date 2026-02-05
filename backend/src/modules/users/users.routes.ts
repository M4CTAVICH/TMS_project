import { Router } from 'express';
import { body } from 'express-validator';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
} from './users.controller';
import { validate } from '../../shared/middleware/validator';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { ROLES } from '../../config/constants';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create user (Manager only)
router.post(
  '/',
  authorize(ROLES.MANAGER),
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role')
      .isIn(Object.values(ROLES))
      .withMessage('Valid role is required'),
    validate,
  ],
  createUser
);

// Get all users
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user (Manager only)
router.put(
  '/:id',
  authorize(ROLES.MANAGER),
  [
    body('firstName').optional().notEmpty(),
    body('lastName').optional().notEmpty(),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  updateUser
);

// Delete user (Manager only)
router.delete('/:id', authorize(ROLES.MANAGER), deleteUser);

// Activate user (Manager only)
router.post('/:id/activate', authorize(ROLES.MANAGER), activateUser);

// Deactivate user (Manager only)
router.post('/:id/deactivate', authorize(ROLES.MANAGER), deactivateUser);

export default router;
