import { Request } from 'express';
import { Types } from 'mongoose';

export interface UserContext {
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  email?: string;
  role?: string;
}

export async function getUserContext(
  req: Request
): Promise<UserContext | null> {
  // authenticate middleware нь req.userId, req.organizationId,
  // req.userRole гэж шууд тавьдаг
  const userId = req.userId;
  const organizationId = req.organizationId;
  const role = req.userRole;

  if (!userId) return null;

  return {
    userId: new Types.ObjectId(userId),
    organizationId:
      organizationId && organizationId.length > 0
        ? new Types.ObjectId(organizationId)
        : undefined,
    role,
  };
}