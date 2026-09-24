import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Todo API', () => {
  let accessToken: string;
  let todoId: string;

  beforeEach(async () => {
    // Register + Login
    await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'todouser', password: 'Test123!@#' });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'todouser', password: 'Test123!@#' });

    accessToken = login.body.data.accessToken;
  });

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  // ============ CREATE (3 тест) ============
  describe('POST /api/v1/todos', () => {
    it('1. should create a todo', async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Test todo', category: 'Ажил', priority: 'high' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toBe('Test todo');
      expect(res.body.data.category).toBe('Ажил');
      expect(res.body.data.priority).toBe('high');
      expect(res.body.data.completed).toBe(false);
      todoId = res.body.data._id;
    });

    it('2. should reject empty text', async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: '' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('3. should reject unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .send({ text: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  // ============ LIST (2 тест) ============
  describe('GET /api/v1/todos', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Todo 1', category: 'Ажил' });
      await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Todo 2', category: 'Хувийн' });
    });

    it('4. should list all todos', async () => {
      const res = await request(app).get('/api/v1/todos').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.todos).toHaveLength(2);
    });

    it('5. should filter by category', async () => {
      const res = await request(app)
        .get('/api/v1/todos?category=Ажил')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.todos).toHaveLength(1);
      expect(res.body.todos[0].category).toBe('Ажил');
    });
  });

  // ============ TOGGLE (2 тест) ============
  describe('PUT /api/v1/todos/:id/toggle', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Toggle test' });
      todoId = res.body.data._id;
    });

    it('6. should toggle to completed', async () => {
      const res = await request(app)
        .put(`/api/v1/todos/${todoId}/toggle`)
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it('7. should return 404 for invalid id', async () => {
      const res = await request(app)
        .put('/api/v1/todos/000000000000000000000000/toggle')
        .set(auth());

      expect(res.status).toBe(404);
    });
  });

  // ============ UPDATE (2 тест) ============
  describe('PATCH /api/v1/todos/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Original' });
      todoId = res.body.data._id;
    });

    it('8. should update todo text', async () => {
      const res = await request(app)
        .patch(`/api/v1/todos/${todoId}`)
        .set(auth())
        .send({ text: 'Updated text' });

      expect(res.status).toBe(200);
      expect(res.body.data.text).toBe('Updated text');
    });

    it('9. should update category', async () => {
      const res = await request(app)
        .patch(`/api/v1/todos/${todoId}`)
        .set(auth())
        .send({ category: 'Хичээл' });

      expect(res.status).toBe(200);
      expect(res.body.data.category).toBe('Хичээл');
    });
  });

  // ============ DELETE (1 тест) ============
  describe('DELETE /api/v1/todos/:id', () => {
    it('10. should delete todo', async () => {
      const create = await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Delete me' });
      const id = create.body.data._id;

      const res = await request(app)
        .delete(`/api/v1/todos/${id}`)
        .set(auth());

      expect(res.status).toBe(200);

      const list = await request(app).get('/api/v1/todos').set(auth());
      expect(list.body.todos).toHaveLength(0);
    });
  });

  // ============ STATS (2 тест) ============
  describe('GET /api/v1/todos/stats', () => {
    beforeEach(async () => {
      const t1 = await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Todo 1' });
      await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Todo 2' });

      await request(app)
        .put(`/api/v1/todos/${t1.body.data._id}/toggle`)
        .set(auth());
    });

    it('11. should return stats', async () => {
      const res = await request(app).get('/api/v1/todos/stats').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.completed).toBe(1);
      expect(res.body.data.pending).toBe(1);
    });

    it('12. should return zero stats for new user', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'newuser1', password: 'Test123!@#' });

      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'newuser1', password: 'Test123!@#' });

      const res = await request(app)
        .get('/api/v1/todos/stats')
        .set({ Authorization: `Bearer ${login.body.data.accessToken}` });

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
    });
  });
});