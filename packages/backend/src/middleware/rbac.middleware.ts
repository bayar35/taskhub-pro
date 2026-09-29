import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

type Permission =
  | 'todo:create' | 'todo:read' | 'todo:update' | 'todo:delete'
  | 'user:invite' | 'user:remove' | 'user:update'
  | 'billing:view' | 'billing:update'
  | 'org:update' | 'org:delete';

const rolePermissions: Record<string, Permission[]> = {
  owner: [
    'todo:create', 'todo:read', 'todo:update', 'todo:delete',
    'user:invite', 'user:remove', 'user:update',
    'billing:view', 'billing:update',
    'org:update', 'org:delete',
  ],
  admin: [
    'todo:create', 'todo:read', 'todo:update', 'todo:delete',
    'user:invite', 'user:remove', 'user:update',
    'billing:view',
    'org:update',
  ],
  member: [
    'todo:create', 'todo:read', 'todo:update', 'todo:delete',
  ],
};

export const requirePermission = (...permissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.userRole;
    if (!role) {
      return next(ApiError.unauthorized('Нэвтрэх шаардлагатай'));
    }

    const userPermissions = rolePermissions[role] || [];
    const hasPermission = permissions.every((p) =>
      userPermissions.includes(p)
    );

    if (!hasPermission) {
      return next(ApiError.forbidden('Эрх хүрэлцэхгүй'));
    }
    next();
  };
};