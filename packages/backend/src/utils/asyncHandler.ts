import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.log('🔍 asyncHandler catch:', err.name, err.constructor.name);

      // ⭐ Zod validation error → 400
      const isZodError =
        err?.name === 'ZodError' ||
        err?.constructor?.name === 'ZodError' ||
        Array.isArray(err?.issues);

      if (isZodError) {
        const issues = err.issues || err.errors || [];
        return res.status(400).json({
          success: false,
          message: 'Validation алдаа',
          errors: issues.map((e: any) => ({
            field: (e.path || []).join('.'),
            message: e.message,
          })),
        });
      }

      // ⭐ ApiError → statusCode
      if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
          ...(err.errors.length > 0 && { errors: err.errors }),
        });
      }

      // Бусад алдаа → error.middleware (500)
      next(err);
    });
  };