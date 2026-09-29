import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Organization } from '../models/Organization.model';
import { Todo } from '../models/Todo.model';

export const checkTodoLimit = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const org = await Organization.findById(organizationId);
    
    if (!org) {
      throw ApiError.notFound('Байгууллага олдсонгүй');
    }

    const todoCount = await Todo.countDocuments({ organizationId });
    
    if (todoCount >= org.limits.maxTodos) {
      throw ApiError.forbidden(
        `Таны багцын хязгаар (${org.limits.maxTodos}) хүрсэн. ` +
        `Pro багц руу шилжинэ үү.`
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const checkMemberLimit = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const org = await Organization.findById(organizationId);
    
    if (!org) {
      throw ApiError.notFound('Байгууллага олдсонгүй');
    }

    if (org.members.length >= org.limits.maxMembers) {
      throw ApiError.forbidden(
        `Таны багцын гишүүний хязгаар (${org.limits.maxMembers}) хүрсэн.`
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};