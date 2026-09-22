import { User, IUserDoc } from '../../models/User.model';

export class AuthRepository {
  async findByUsername(username: string): Promise<IUserDoc | null> {
    return User.findOne({ username }).select('+password');
  }

  async findById(id: string): Promise<IUserDoc | null> {
    return User.findById(id);
  }

  async create(data: Partial<IUserDoc>): Promise<IUserDoc> {
    return User.create(data);
  }

  async addRefreshToken(
    userId: string,
    token: string
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: { refreshTokens: token },
    });
  }

  async removeRefreshToken(
    userId: string,
    token: string
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: token },
    });
  }
}

export const authRepository = new AuthRepository();