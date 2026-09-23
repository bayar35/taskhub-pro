import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(ApiError.notFound(`Олдсонгүй: ${req.originalUrl}`));
};

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Серверийн алдаа';
  let errors: any[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // ⭐ ЭНИЙГ НЭМЭХ — Sentry-д 5xx алдаа илгээх
  if (statusCode >= 500) {
    Sentry.captureException(err);
  }

  logger.error(`${statusCode} - ${message} - ${req.originalUrl}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};