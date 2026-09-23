import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      console.log('🔍 validate.middleware catch:', err?.name, err?.constructor?.name);

      // ⭐ ZodError илрүүлэх (3 шалгалт)
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

      next(err);
    }
  };