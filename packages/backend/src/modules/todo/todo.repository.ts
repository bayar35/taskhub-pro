import { Todo } from '../../models/Todo.model';

class TodoRepository {
  async findAll(params: {
    organizationId: string;  // ⬅️ Гол өөрчлөлт
    userId?: string;
    filters?: any;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const { organizationId, userId, filters = {}, sort = '-createdAt', page = 1, limit = 20 } = params;

    const query: any = { organizationId };
    
    // Зөвхөн тухайн хэрэглэгчийн todo-г харах (optional)
    if (userId) query.userId = userId;

    if (filters.search) {
      query.text = { $regex: filters.search, $options: 'i' };
    }
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;
    if (filters.completed !== undefined) query.completed = filters.completed;

    const skip = (page - 1) * limit;
    const [todos, total] = await Promise.all([
      Todo.find(query).sort(sort).skip(skip).limit(limit).lean(),
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

  async create(data: any) {
    return Todo.create(data);
  }

  async findById(id: string, organizationId: string) {
    return Todo.findOne({ _id: id, organizationId });
  }

  async update(id: string, organizationId: string, data: any) {
    return Todo.findOneAndUpdate(
      { _id: id, organizationId },
      data,
      { new: true }
    );
  }

  async delete(id: string, organizationId: string) {
    return Todo.findOneAndDelete({ _id: id, organizationId });
  }

  async getStats(organizationId: string, userId?: string) {
    const query: any = { organizationId };
    if (userId) query.userId = userId;

    const [total, completed, pending] = await Promise.all([
      Todo.countDocuments(query),
      Todo.countDocuments({ ...query, completed: true }),
      Todo.countDocuments({ ...query, completed: false }),
    ]);

    return { total, completed, pending };
  }
}

export const todoRepository = new TodoRepository();