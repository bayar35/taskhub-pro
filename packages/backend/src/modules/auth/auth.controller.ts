import { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { env } from '../../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 хоног
};

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } =
      await authService.login(req.body);

    // Refresh token-ийг HttpOnly cookie-д хийх
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Access token + user-ийг JSON response-д буцаах
    res.json({
      success: true,
      data: { accessToken, user },
    });
  }
);

export const refresh = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Refresh token байхгүй' });
    }

    const { accessToken } = await authService.refresh(token);
    res.json({ success: true, data: { accessToken } });
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const token = req.cookies.refreshToken || '';

    await authService.logout(userId, token);
    res.clearCookie('refreshToken');

    res.json({ success: true, message: 'Гарлаа' });
  }
);

export const me = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const user = await authService.me(userId);
    res.json({ success: true, data: user });
  }
);