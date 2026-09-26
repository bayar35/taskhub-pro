import { describe, it, expect } from 'vitest';
import { todoApi } from '../src/features/todo/todoApi';

describe('todoApi endpoints', () => {
  it('should have getTodos endpoint', () => {
    expect(todoApi.endpoints.getTodos).toBeDefined();
  });

  it('should have getTodoStats endpoint', () => {
    expect(todoApi.endpoints.getTodoStats).toBeDefined();
  });

  it('should have createTodo endpoint', () => {
    expect(todoApi.endpoints.createTodo).toBeDefined();
  });

  it('should have toggleTodo endpoint', () => {
    expect(todoApi.endpoints.toggleTodo).toBeDefined();
  });

  it('should have deleteTodo endpoint', () => {
    expect(todoApi.endpoints.deleteTodo).toBeDefined();
  });
});