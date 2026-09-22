import {
  createTodoSchema,
  updateTodoSchema,
  type ITodo,
  type ITodoFilters,
} from '@taskhub/shared';
import { todoRepository } from './todo.repository';
import { ApiError } from '../../utils/ApiError';

export class TodoService {
  async list(
    userId: string,
    filters: ITodoFilters,
    page?: number,
    limit?: number
  ) {
    const result = await todoRepository.findAll({
      userId,
      filters,
      page,
      limit,
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