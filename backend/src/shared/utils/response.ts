import { Response } from 'express';

interface SuccessResponse {
  success: true;
  data?: any;
  message?: string;
  meta?: any;
}

export const sendSuccess = (
  res: Response,
  data?: any,
  message?: string,
  statusCode: number = 200,
  meta?: any
) => {
  const response: SuccessResponse = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendCreated = (res: Response, data?: any, message: string = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};
