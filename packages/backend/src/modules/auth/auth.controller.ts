import { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { env } from '../../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      if (err.name === 'ZodError' || err.issues) {
        return res.status(400).json({
          success: false,
          message: 'Validation алдаа',
          errors: err.issues?.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })) || [],
        });
      }
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      throw err;
    }
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, data: { accessToken, user } });
  }
);

export const refresh = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token байхгүй' });
    }
    const { accessToken } = await authService.refresh(token);
    res.json({ success: true, data: { accessToken } });
  }
);

// ⬇️ ЗАССАН
export const logout = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;  // ⬅️ (req as any).userId биш
    const token = req.cookies.refreshToken || '';

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Нэвтрээгүй байна' });
    }

    await authService.logout(userId, token);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Гарлаа' });
  }
);

// ⬇️ ЗАССАН
export const me = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;  // ⬅️ (req as any).userId биш
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Нэвтрээгүй байна' });
    }
    const user = await authService.me(userId);
    res.json({ success: true, data: user });
  }
);