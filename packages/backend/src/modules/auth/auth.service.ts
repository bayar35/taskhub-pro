import {
  registerSchema,
  loginSchema,
  type IUser,
  type RegisterInput,
  type LoginInput,
} from '@taskhub/shared';
import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { ApiError } from '../../utils/ApiError';

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export class AuthService {
  async register(input: RegisterInput): Promise<IUser> {
    const data = registerSchema.parse(input);

    const existing = await authRepository.findByUsername(data.username);
    if (existing) {
      throw ApiError.conflict('Энэ нэр бүртгэлтэй байна');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await authRepository.create({
      username: data.username,
      email: data.email || undefined,
      password: hashedPassword,
      role: 'user',
    });

    return this.toPublicUser(user);
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const data = loginSchema.parse(input);

    const user = await authRepository.findByUsername(data.username);
    if (!user) {
      throw ApiError.badRequest('Нэр эсвэл нууц үг буруу');
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw ApiError.badRequest('Нэр эсвэл нууц үг буруу');
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await authRepository.addRefreshToken(user._id.toString(), refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
    };
  }

  async refresh(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(token);
      const user = await authRepository.findById(payload.userId);

      if (!user || !user.refreshTokens.includes(token)) {
        throw ApiError.unauthorized('Хүчингүй refresh token');
      }

      const accessToken = signAccessToken({
        userId: user._id.toString(),
        role: user.role,
      });

      return { accessToken };
    } catch {
      throw ApiError.unauthorized('Хүчингүй refresh token');
    }
  }

  async logout(userId: string, token: string): Promise<void> {
    await authRepository.removeRefreshToken(userId, token);
  }

  async me(userId: string): Promise<IUser> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Хэрэглэгч олдсонгүй');
    }
    return this.toPublicUser(user);
  }

  private toPublicUser(user: any): IUser {
    return {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export const authService = new AuthService();