import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User.model';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Нэвтрэх шаардлагатай');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // DB-с User-ийг бүрэн авах (organizationId-тай хамт)
    const user = await User.findById(payload.userId);
    if (!user) {
      throw ApiError.unauthorized('Хэрэглэгч олдсонгүй');
    }

    req.userId = user._id.toString();
    req.organizationId = user.organizationId?.toString() || '';
    req.userRole = user.role;

    next();
  } catch (error) {
    next(ApiError.unauthorized('Хүчингүй token'));
  }
};

// Backward compatibility
export const authMiddleware = authenticate;