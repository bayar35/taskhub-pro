import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User } from '../../models/User.model';
import { ApiError } from '../../utils/ApiError';

class TwoFactorService {
  async generateSecret(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('Хэрэглэгч олдсонгүй');

    // Secret үүсгэх
    const secret = speakeasy.generateSecret({
      name: `TaskHub Pro (${user.email})`,
      issuer: 'TaskHub Pro',
      length: 32,
    });

    // QR code үүсгэх
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Secret хадгалах (түр зуур)
    user.twoFactorSecret = secret.base32;
    await user.save();

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verifyAndEnable(userId: string, token: string) {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      throw ApiError.badRequest('Secret олдсонгүй');
    }

    // Token шалгах
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1, // 30 секундын tolerance
    });

    if (!verified) {
      throw ApiError.badRequest('Код буруу');
    }

    // Backup codes үүсгэх
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex')
    );

    // Backup codes-ийг hash хийж хадгалах
    const hashedCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, 10))
    );

    user.twoFactorEnabled = true;
    user.backupCodes = hashedCodes;
    await user.save();

    return { backupCodes };
  }

  async verify(userId: string, token: string) {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw ApiError.badRequest('2FA идэвхгүй');
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  async verifyBackupCode(userId: string, code: string) {
    const user = await User.findById(userId).select('+backupCodes');
    if (!user || !user.backupCodes) {
      throw ApiError.badRequest('Backup codes олдсонгүй');
    }

    for (let i = 0; i < user.backupCodes.length; i++) {
      const match = await bcrypt.compare(code, user.backupCodes[i]);
      if (match) {
        // Ашигласан кодыг устгах
        user.backupCodes.splice(i, 1);
        await user.save();
        return true;
      }
    }

    return false;
  }

  async disable(userId: string, token: string) {
    const verified = await this.verify(userId, token);
    if (!verified) throw ApiError.badRequest('Код буруу');

    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      backupCodes: undefined,
    });

    return { success: true };
  }
}

export const twoFactorService = new TwoFactorService();