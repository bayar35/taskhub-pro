export type UserRole = 'user' | 'admin' | 'moderator';

export interface IUser {
  _id: string;
  username: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserPublic {
  _id: string;
  username: string;
  avatar?: string;
  role: UserRole;
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}