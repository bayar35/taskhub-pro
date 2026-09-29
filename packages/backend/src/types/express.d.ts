import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      organizationId?: string;
      userRole?: 'owner' | 'admin' | 'member' | 'user';
      user?: {
        _id: Types.ObjectId;
        username: string;
        email: string;
        role: string;
        organizationId?: Types.ObjectId;
      };
    }
  }
}

export {};