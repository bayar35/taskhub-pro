import {
  createTodoSchema,
  updateTodoSchema,
  type ITodo,
  type TodoQueryInput,
} from '@taskhub/shared';
import { todoRepository } from './todo.repository';
import { ApiError } from '../../utils/ApiError';
import { notificationService } from '../notification/notification.service';
import { User } from '../../models/User.model';
import { sendEmail, getTodoCreatedEmail } from '../../utils/mailer';
import { cacheGet, cacheSet, cacheDel } from '../../config/redis';

export class TodoService {
  async list(organizationId: string, query: TodoQueryInput, userId?: string) {
    const cacheKey = `todos:${organizationId}:${JSON.stringify(query)}:${userId || 'all'}`;

    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    const result = await todoRepository.findAll({
      organizationId,
      userId,
      filters: {
        search: query.search,
        category: query.category,
        priority: query.priority,
        completed: query.completed,
      },
      sort: query.sort,
      page: query.page,
      limit: query.limit,
    });

    const response = {
      todos: result.todos.map(this.toPublicTodo),
      pagination: result.pagination,
    };

    await cacheSet(cacheKey, response, 60);
    return response;
  }

  async getById(id: string, organizationId: string): Promise<ITodo> {
    const todo = await todoRepository.findById(id, organizationId);
    if (!todo) {
      throw ApiError.notFound('Todo олдсонгүй');
    }
    return this.toPublicTodo(todo);
  }

  async create(organizationId: string, userId: string, input: any): Promise<ITodo> {
    const data = createTodoSchema.parse(input);

    const todo = await todoRepository.create({
      organizationId,
      userId,
      text: data.text,
      category: data.category,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      tags: data.tags || [],
      completed: false,
    });

    // Cache цэвэрлэх
    await cacheDel(`todos:${organizationId}:*`);

    // Notification илгээх
    try {
      await notificationService.create({
        userId,
        type: 'success',
        title: 'Шинэ даалгавар нэмэгдлээ',
        message: `"${data.text}" амжилттай нэмэгдлээ`,
        link: '/dashboard',
      });
    } catch (err) {
      console.error('Notification илгээх алдаа:', err);
    }

    // Email илгээх
    try {
      const user = await User.findById(userId);
      if (user?.email) {
        sendEmail(
          user.email,
          'Шинэ даалгавар нэмэгдлээ',
          getTodoCreatedEmail(user.username, todo.text)
        ).catch(() => {});
      }
    } catch (err) {
      console.error('И-мэйл илгээх алдаа:', err);
    }

    return this.toPublicTodo(todo);
  }

  async update(id: string, organizationId: string, input: any): Promise<ITodo> {
    const data = updateTodoSchema.parse(input);

    const updateData: any = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const todo = await todoRepository.update(id, organizationId, updateData);
    if (!todo) {
      throw ApiError.notFound('Todo олдсонгүй');
    }

    await cacheDel(`todos:${organizationId}:*`);
    return this.toPublicTodo(todo);
  }

  async toggle(id: string, organizationId: string): Promise<ITodo> {
    const existing = await todoRepository.findById(id, organizationId);
    if (!existing) {
      throw ApiError.notFound('Todo олдсонгүй');
    }

    const todo = await todoRepository.update(id, organizationId, {
      completed: !existing.completed,
    });

    await cacheDel(`todos:${organizationId}:*`);
    return this.toPublicTodo(todo!);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const todo = await todoRepository.delete(id, organizationId);
    if (!todo) {
      throw ApiError.notFound('Todo олдсонгүй');
    }
    await cacheDel(`todos:${organizationId}:*`);
  }

  async getStats(organizationId: string, userId?: string) {
    return todoRepository.getStats(organizationId, userId);
  }

  private toPublicTodo(todo: any): ITodo {
    return {
      _id: todo._id.toString(),
      userId: todo.userId.toString(),
      text: todo.text,
      category: todo.category,
      priority: todo.priority,
      dueDate: todo.dueDate?.toISOString(),
      completed: todo.completed,
      tags: todo.tags || [],
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    };
  }
}

export const todoService = new TodoService();