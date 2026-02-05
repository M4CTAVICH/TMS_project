import { Request, Response, NextFunction } from 'express';
import { UserService } from './users.service';
import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess, sendCreated } from '../../shared/utils/response';

const userService = new UserService();

export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.createUser(req.body);
    sendCreated(res, { user }, 'User created successfully');
  }
);

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string | undefined;

    const result = await userService.getUsers(page, limit, role);
    sendSuccess(res, result.users, undefined, 200, result.meta);
  }
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, { user });
  }
);

export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, { user }, 'User updated successfully');
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.deleteUser(req.params.id);
    sendSuccess(res, result);
  }
);

export const activateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.activateUser(req.params.id);
    sendSuccess(res, { user }, 'User activated successfully');
  }
);

export const deactivateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.deactivateUser(req.params.id);
    sendSuccess(res, { user }, 'User deactivated successfully');
  }
);
