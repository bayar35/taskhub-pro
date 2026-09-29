import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { Todo } from '../src/models/Todo.model';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup';

let accessToken: string;
let userId: string;
let organizationId: string;

beforeAll(async () => {
  await connectTestDB();

  // 1. Register
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'todouser',
      email: 'todouser@test.com',
      password: 'Test123!@#',
    });

  if (registerRes.status !== 201) {
    console.error('❌ Register failed:', registerRes.status, registerRes.body);
    throw new Error('Register failed');
  }

  console.log('✅ Register OK:', {
    _id: registerRes.body.data._id,
    organizationId: registerRes.body.data.organizationId,
  });

  // 2. Login
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ username: 'todouser', password: 'Test123!@#' });

  if (!loginRes.body.data?.accessToken) {
    console.error('❌ Login failed:', loginRes.body);
    throw new Error('Login failed');
  }

  accessToken = loginRes.body.data.accessToken;
  userId = registerRes.body.data._id;
  organizationId = registerRes.body.data.organizationId;

  console.log('✅ Login OK, token:', accessToken.slice(0, 20) + '...');
}, 60000);
afterAll(async () => {
  await disconnectTestDB();
}, 30000);

beforeEach(async () => {
  await Todo.deleteMany({});
});

const auth = () => ({ Authorization: `Bearer ${accessToken}` });

describe('Todo API', () => {
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

  describe('GET /api/v1/todos', () => {
    beforeEach(async () => {
      await Todo.create([
        {
          organizationId,
          userId,
          text: 'Todo 1',
          category: 'Ажил',
          priority: 'high',
          completed: false,
          tags: [],
        },
        {
          organizationId,
          userId,
          text: 'Todo 2',
          category: 'Хувийн',
          priority: 'medium',
          completed: false,
          tags: [],
        },
      ]);
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

  describe('PUT /api/v1/todos/:id/toggle', () => {
    let todoId: string;

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

  describe('PATCH /api/v1/todos/:id', () => {
    let todoId: string;

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
        .send({ text: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.text).toBe('Updated');
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

      const get = await request(app)
        .get(`/api/v1/todos/${id}`)
        .set(auth());
      expect(get.status).toBe(404);
    });
  });

  describe('GET /api/v1/todos/stats', () => {
    beforeEach(async () => {
      const t1 = await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Stats 1' });
      await request(app)
        .put(`/api/v1/todos/${t1.body.data._id}/toggle`)
        .set(auth());

      await request(app)
        .post('/api/v1/todos')
        .set(auth())
        .send({ text: 'Stats 2' });
    });

    it('11. should return stats', async () => {
      const res = await request(app).get('/api/v1/todos/stats').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.completed).toBe(1);
      expect(res.body.data.pending).toBe(1);
    });

    it('12. should return zero stats for new user', async () => {
      await Todo.deleteMany({});

      const res = await request(app).get('/api/v1/todos/stats').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
    });
  });

  describe('GET /api/v1/todos?search=...', () => {
    beforeEach(async () => {
      await Todo.create([
        {
          organizationId,
          userId,
          text: 'React сурах',
          category: 'Хичээл',
          priority: 'high',
          completed: false,
          tags: [],
        },
        {
          organizationId,
          userId,
          text: 'TypeScript дасгал',
          category: 'Хичээл',
          priority: 'medium',
          completed: false,
          tags: [],
        },
        {
          organizationId,
          userId,
          text: 'Худалдан авалт',
          category: 'Хувийн',
          priority: 'low',
          completed: false,
          tags: [],
        },
      ]);
    });

    it('13. should search by text (case-insensitive)', async () => {
      const res = await request(app)
        .get('/api/v1/todos?search=react')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.todos).toHaveLength(1);
      expect(res.body.todos[0].text).toBe('React сурах');
    });

    it('14. should search by partial text', async () => {
      const res = await request(app)
        .get('/api/v1/todos?search=Type')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.todos).toHaveLength(1);
      expect(res.body.todos[0].text).toContain('TypeScript');
    });

    it('15. should search by category', async () => {
      const res = await request(app)
        .get('/api/v1/todos?category=Хичээл')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.todos).toHaveLength(2);
    });

    it('16. should return empty array for no match', async () => {
      const res = await request(app)
        .get('/api/v1/todos?search=xyz123')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.todos).toHaveLength(0);
    });

    it('17. should combine search with category filter', async () => {
      const res = await request(app)
        .get('/api/v1/todos?search=React&category=Хичээл')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.todos).toHaveLength(1);
    });
  });
});