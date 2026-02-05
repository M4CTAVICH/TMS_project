import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/AppError';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : undefined,
      message: err.msg,
    }));
    
    throw new ValidationError('Validation failed', formattedErrors);
  }
  
  next();
};
