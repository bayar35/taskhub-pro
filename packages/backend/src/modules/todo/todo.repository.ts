import { Todo, ITodoDoc } from '../../models/Todo.model';
import type { ITodoFilters } from '@taskhub/shared';

interface FindOptions {
  userId: string;
  filters: ITodoFilters;
  page?: number;
  limit?: number;
}

export class TodoRepository {
  async findAll({ userId, filters, page = 1, limit = 50 }: FindOptions) {
    const query: any = { userId };

    if (filters.category && filters.category !== 'Бүгд') {
      query.category = filters.category;
    }

    if (filters.completed !== undefined) {
      query.completed = filters.completed;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.search) {
      query.text = { $regex: filters.search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [todos, total] = await Promise.all([
      Todo.find(query)
        .sort({ completed: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Todo.countDocuments(query),
    ]);

    return {
      todos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string): Promise<ITodoDoc | null> {
    return Todo.findOne({ _id: id, userId });
  }

  async create(data: Partial<ITodoDoc>): Promise<ITodoDoc> {
    return Todo.create(data);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<ITodoDoc>
  ): Promise<ITodoDoc | null> {
    return Todo.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string, userId: string): Promise<ITodoDoc | null> {
    return Todo.findOneAndDelete({ _id: id, userId });
  }

  async getStats(userId: string) {
    const stats = await Todo.aggregate([
      { $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$completed', 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return { total: 0, completed: 0, pending: 0 };
    }

    return {
      total: stats[0].total,
      completed: stats[0].completed,
      pending: stats[0].total - stats[0].completed,
    };
  }
}

export const todoRepository = new TodoRepository();