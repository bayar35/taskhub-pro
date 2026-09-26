import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userId?: string;  // ⬅️ НЭМЭХ
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token байхгүй' });
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    req.userId = payload.userId;  // ⬅️ НЭМЭХ
    next();
  } catch {
    return res.status(401).json({ message: 'Token хүчингүй эсвэл хугацаа дууссан' });
  }
}

export const requireAuth = authenticate;