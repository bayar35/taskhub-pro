import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Auth API', () => {
  const testUser = {
    username: 'testuser',
    password: 'Test123!@#',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe(testUser.username);
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
      await request(app).post('/api/v1/auth/register').send(testUser);
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.username).toBe(testUser.username);
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: testUser.username, password: 'wrong' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send(testUser);
      accessToken = login.body.data.accessToken;
    });

    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe(testUser.username);
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

    // ============================================================
  // REFRESH TOKEN ТЕСТҮҮД
  // ============================================================
  describe('Refresh Token', () => {
    let accessToken: string;
    let refreshCookie: string;

    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send(testUser);

      accessToken = login.body.data.accessToken;
      // Refresh token нь httpOnly cookie-д ирдэг
      refreshCookie = login.headers['set-cookie']?.[0] || '';
    });

    it('should return refresh token in httpOnly cookie on login', async () => {
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send(testUser);

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
    // Token нь JWT форматтай эсэхийг шалгах (3 хэсэг, цэгээр тусгаарлагдсан)
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
      expect(res.body.message).toBe('Гарлаа');

      // Cookie устгагдах ёстой
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies![0]).toContain('refreshToken=;');
    });

    it('should reject refresh after logout', async () => {
      // 1. Logout хийх
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie);

      // 2. Дахин refresh турших — ажиллахгүй байх ёстой
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