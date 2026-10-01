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
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup';

// Тест бүрт давхцахгүй байхын тулд unique нэр үүсгэх функц
const getUniqueUser = () => {
  const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  return {
    username: `testuser_${uniqueSuffix}`,
    email: `testuser_${uniqueSuffix}@test.com`,
    password: 'Test123!@#',
  };
};

beforeAll(async () => {
  await connectTestDB();
}, 60000);

afterAll(async () => {
  await disconnectTestDB();
}, 30000);

beforeEach(async () => {
  await clearTestDB();
});

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const user = getUniqueUser();
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(user);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe(user.username);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'weak', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      const user = getUniqueUser();
      
      // Эхний удаа амжилттай бүртгэнэ
      await request(app).post('/api/v1/auth/register').send(user);
      
      // Дараа нь мөн ижил хэрэглэгчээр дахин бүртгэхэд алдаа өгөх ёстой
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(user);

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let currentUser: any;

    beforeEach(async () => {
      currentUser = getUniqueUser();
      await request(app).post('/api/v1/auth/register').send(currentUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: currentUser.username, password: currentUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.username).toBe(currentUser.username);
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: currentUser.username, password: 'wrong' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;
    let currentUser: any;

    beforeEach(async () => {
      currentUser = getUniqueUser();
      await request(app).post('/api/v1/auth/register').send(currentUser);
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: currentUser.username, password: currentUser.password });
      accessToken = login.body.data.accessToken;
    });

    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe(currentUser.username);
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Refresh Token', () => {
    let accessToken: string;
    let refreshCookie: string;
    let currentUser: any;

    beforeEach(async () => {
      currentUser = getUniqueUser();
      await request(app).post('/api/v1/auth/register').send(currentUser);
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: currentUser.username, password: currentUser.password });

      accessToken = login.body.data.accessToken;
      refreshCookie = login.headers['set-cookie']?.[0] || '';
    });

    it('should return refresh token in httpOnly cookie on login', async () => {
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: currentUser.username, password: currentUser.password });

      const cookies = login.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies![0]).toContain('refreshToken=');
      expect(cookies![0]).toContain('HttpOnly');
    });

    it('should return new access token with valid refresh token', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.accessToken.split('.')).toHaveLength(3);
    });

    it('should reject refresh without cookie', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=invalid.token.here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should logout and clear refresh token cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies![0]).toContain('refreshToken=;');
    });

    it('should reject refresh after logout', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject logout without access token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', refreshCookie);

      expect(res.status).toBe(401);
    });
  });
});