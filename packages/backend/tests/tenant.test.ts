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

let user1: any;
let user2: any;

beforeAll(async () => {
  await connectTestDB();

  // User 1 бүртгэх
  const reg1 = await request(app).post('/api/v1/auth/register').send({
    username: 'tenant1',
    email: 'tenant1@test.com',
    password: 'Test123!@#',
  });

  if (reg1.status !== 201) {
    console.error('Register 1 failed:', reg1.status, reg1.body);
    throw new Error('Register 1 failed');
  }

  const login1 = await request(app)
    .post('/api/v1/auth/login')
    .send({ username: 'tenant1', password: 'Test123!@#' });

  user1 = login1.body.data;

  // User 2 бүртгэх
  const reg2 = await request(app).post('/api/v1/auth/register').send({
    username: 'tenant2',
    email: 'tenant2@test.com',
    password: 'Test123!@#',
  });

  if (reg2.status !== 201) {
    console.error('Register 2 failed:', reg2.status, reg2.body);
    throw new Error('Register 2 failed');
  }

  const login2 = await request(app)
    .post('/api/v1/auth/login')
    .send({ username: 'tenant2', password: 'Test123!@#' });

  user2 = login2.body.data;
}, 60000);

afterAll(async () => {
  await disconnectTestDB();
}, 30000);

beforeEach(async () => {
  await Todo.deleteMany({});
});

describe('Multi-tenancy', () => {
  it('should not access other organization todos', async () => {
    // Org 1-д todo үүсгэх
    const todo1 = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .send({ text: 'Org 1 todo' });

    expect(todo1.status).toBe(201);

    // Org 2-с Org 1-ийн todo-г харах оролдлого
    const response = await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${user2.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.todos).toHaveLength(0);
  });
});