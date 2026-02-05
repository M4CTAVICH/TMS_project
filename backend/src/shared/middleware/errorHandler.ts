import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    };

    if (err instanceof ValidationError && err.errors.length > 0) {
      response.errors = err.errors;
    }

    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    return res.status(err.statusCode).json(response);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with this unique field already exists',
        statusCode: 409,
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        statusCode: 404,
      });
    }
  }

  // Generic error
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
