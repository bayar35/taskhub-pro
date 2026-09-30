import {
  registerSchema,
  loginSchema,
  type IUser,
  type RegisterInput,
  type LoginInput,
} from '@taskhub/shared';
import { authRepository } from './auth.repository';
import { User } from '../../models/User.model';
import { hashPassword, comparePassword } from '../../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { ApiError } from '../../utils/ApiError';
import { twoFactorService } from './twoFactor.service';
import { organizationService } from '../organization/organization.service';
import { logger } from '../../config/logger';

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export class AuthService {
  async register(input: RegisterInput): Promise<IUser> {
    try {
      logger.info(`🔍 Register started: ${input.username}`);

      const data = registerSchema.parse(input);
      logger.info('✅ Validation passed');

      const existing = await authRepository.findByUsername(data.username);
      if (existing) {
        throw ApiError.conflict('Энэ нэр бүртгэлтэй байна');
      }
      logger.info('✅ No existing user');

      const hashedPassword = await hashPassword(data.password);
      logger.info('✅ Password hashed');

      const user = await authRepository.create({
        username: data.username,
        email: data.email || `${data.username}@taskhub.local`,
        password: hashedPassword,
        role: 'owner',
      });
      logger.info(`✅ User created: ${user._id}`);

      // Organization
      try {
        await organizationService.create(
          user._id.toString(),
          `${data.username}-ийн байгууллага`
        );
        logger.info('✅ Organization created');
      } catch (error: any) {
        logger.error(`❌ Organization error: ${error.message}`);
        logger.error(`Stack: ${error.stack}`);
        await User.findByIdAndDelete(user._id);
        throw ApiError.internal(
          `Байгууллага үүсгэхэд алдаа: ${error.message}`
        );
      }

      const updatedUser = await authRepository.findById(user._id.toString());
      if (!updatedUser) {
        throw ApiError.internal('Хэрэглэгч олдсонгүй');
      }
      logger.info('✅ Register complete');
      return this.toPublicUser(updatedUser);
    } catch (error: any) {
      logger.error(`❌ Register error: ${error.message}`);
      logger.error(`Stack: ${error.stack}`);
      throw error;
    }
  }

  async login(
    input: LoginInput & { twoFactorToken?: string }
  ): Promise<LoginResult> {
    const data = loginSchema.parse(input);

    const user = await User.findOne({ username: data.username }).select(
      '+password +twoFactorSecret'
    );
    if (!user) {
      throw ApiError.badRequest('Нэр эсвэл нууц үг буруу');
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw ApiError.badRequest('Нэр эсвэл нууц үг буруу');
    }

    if (user.twoFactorEnabled) {
      if (!input.twoFactorToken) {
        throw ApiError.unauthorized('2FA код шаардлагатай');
      }

      const validToken = await twoFactorService.verify(
        user._id.toString(),
        input.twoFactorToken
      );

      if (!validToken) {
        const validBackup = await twoFactorService.verifyBackupCode(
          user._id.toString(),
          input.twoFactorToken
        );
        if (!validBackup) {
          throw ApiError.unauthorized('2FA код буруу');
        }
      }
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await authRepository.addRefreshToken(user._id.toString(), refreshToken);

    user.lastLoginAt = new Date();
    await user.save();

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
      organizationId: user.organizationId?.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    } as any;
  }
}

export const authService = new AuthService();