import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Organization } from '../models/Organization.model';

declare global {
  namespace Express {
    interface Request {
      organizationId?: string;
      userRole?: 'owner' | 'admin' | 'member';
    }
  }
}

export const tenantMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;
    if (!user) {
      throw ApiError.unauthorized('Нэвтрэх шаардлагатай');
    }

    const organization = await Organization.findById(user.organizationId);
    if (!organization) {
      throw ApiError.notFound('Байгууллага олдсонгүй');
    }

    // Subscription шалгах
    if (
      organization.subscription.status === 'canceled' ||
      organization.subscription.status === 'past_due'
    ) {
      throw ApiError.forbidden('Subscriptions-ийн хугацаа дууссан');
    }

    req.organizationId = user.organizationId.toString();
    req.userRole = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

// Role шалгах middleware
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(ApiError.forbidden('Эрх хүрэлцэхгүй'));
    }
    next();
  };
};