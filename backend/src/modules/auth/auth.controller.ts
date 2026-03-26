import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../shared/middleware/asyncHandler";
import { sendSuccess } from "../../shared/utils/response";
import { AuthRequest } from "../../shared/middleware/auth";
import { UnauthorizedError } from "../../shared/errors/AppError";

const authService = new AuthService();

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result, "Login successful");
  },
);

export const verifyToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.substring(7);

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const user = await authService.verifyToken(token);
    sendSuccess(res, { user }, "Token is valid");
  },
);

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await authService.getProfile(req.user!.id);
    sendSuccess(res, { user }, "Profile fetched successfully");
  },
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, { user }, "Profile updated successfully");
  },
);

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );
    sendSuccess(res, result);
  },
);

export const createUser = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const result = await authService.createUser(req.body);
    sendSuccess(res, result, "User created successfully", 201);
  },
);
