import {
  createTodoSchema,
  updateTodoSchema,
  type ITodo,
  type TodoQueryInput,
  type CreateTodoInput,
} from '@taskhub/shared';
import { todoRepository } from './todo.repository';
import { ApiError } from '../../utils/ApiError';
import { notificationService } from '../notification/notification.service';
import { User } from '../../models/User.model';
import { sendEmail, getTodoCreatedEmail } from '../../utils/mailer';

export class TodoService {
  async list(userId: string, query: TodoQueryInput) {
    const result = await todoRepository.findAll({
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

    return {
      todos: result.todos.map(this.toPublicTodo),
      pagination: result.pagination,
    };
  }

  async getById(id: string, userId: string): Promise<ITodo> {
    const todo = await todoRepository.findById(id, userId);
    if (!todo) {
      throw ApiError.notFound('Todo олдсонгүй');
    }
    return this.toPublicTodo(todo);
  }

  async create(userId: string, input: any): Promise<ITodo> {
    const data = createTodoSchema.parse(input);

    const todo = await todoRepository.create({
      userId: userId as any,
      text: data.text,
      category: data.category,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      tags: data.tags || [],
      completed: false,
    });

    // 1. Notification илгээх (алдаа гарвал алгасах)
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

    // 2. И-мэйл илгээх (async, алдаа гарвал зогсоохгүй)
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

  async update(id: string, userId: string, input: any): Promise<ITodo> {
    const data = updateTodoSchema.parse(input);

    const updateData: any = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const todo = await todoRepository.update(id, userId, updateData);
    if (!todo) {
      throw ApiError.notFound('Todo олдсонгүй');
    }

    return this.toPublicTodo(todo);
  }

  async toggle(id: string, userId: string): Promise<ITodo> {
    const existing = await todoRepository.findById(id, userId);
    if (!existing) {
      throw ApiError.notFound('Todo олдсонгүй');
    }

    const todo = await todoRepository.update(id, userId, {
      completed: !existing.completed,
    });

    return this.toPublicTodo(todo!);
  }

  async delete(id: string, userId: string): Promise<void> {
    const todo = await todoRepository.delete(id, userId);
    if (!todo) {
      throw ApiError.notFound('Todo олдсонгүй');
    }
  }

  async getStats(userId: string) {
    return todoRepository.getStats(userId);
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