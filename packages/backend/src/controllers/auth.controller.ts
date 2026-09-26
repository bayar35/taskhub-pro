import { Request, Response } from 'express';
import { User } from '../models/User.model';
import RefreshToken from '../models/RefreshToken';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '../utils/jwt';
import { env } from '../config/env';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 хоног (ms)

// 1. LOGIN — хоёр токен үүсгэж, refresh-ийг DB + httpOnly cookie-д хадгална
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу' });
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Refresh token-ийг DB-д хадгалах
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_MAX_AGE),
    });

    // httpOnly cookie-д хийх
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_MAX_AGE,
    });

    return res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Серверийн алдаа' });
  }
}

// 2. REFRESH — шинэ access token буцаана
export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ message: 'Refresh token байхгүй' });
    }

    // 1) JWT-г шалгах
    let decoded: JwtPayload;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(403).json({ message: 'Refresh token хүчингүй' });
    }

    // 2) DB-д байгаа эсэхийг шалгах
    const stored = await RefreshToken.findOne({ token });
    if (!stored) {
      return res.status(403).json({ message: 'Refresh token хүчингүй' });
    }

    // 3) Шинэ access token үүсгэх
    const newAccessToken = signAccessToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(500).json({ message: 'Серверийн алдаа' });
  }
}

// 3. LOGOUT — refresh token-ийг DB-ээс болон cookie-ээс устгана
export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await RefreshToken.deleteOne({ token });
    }

    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ message: 'Амжилттай гарлаа' });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ message: 'Серверийн алдаа' });
  }
}