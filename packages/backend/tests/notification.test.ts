import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Notification API', () => {
  let accessToken: string;

  beforeEach(async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'notifuser', password: 'Test123!@#' });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'notifuser', password: 'Test123!@#' });

    accessToken = login.body.data.accessToken;
  });

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  it('1. should return empty list for new user', async () => {
    const res = await request(app).get('/api/v1/notifications').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toHaveLength(0);
    expect(res.body.data.unreadCount).toBe(0);
  });

  it('2. should create notification when todo is created', async () => {
    await request(app)
      .post('/api/v1/todos')
      .set(auth())
      .send({ text: 'Test todo', category: 'Ажил' });

    const res = await request(app).get('/api/v1/notifications').set(auth());

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toHaveLength(1);
    expect(res.body.data.unreadCount).toBe(1);
    expect(res.body.data.notifications[0].type).toBe('success');
  });

  it('3. should mark notification as read', async () => {
    await request(app)
      .post('/api/v1/todos')
      .set(auth())
      .send({ text: 'Test todo' });

    const list = await request(app).get('/api/v1/notifications').set(auth());
    const id = list.body.data.notifications[0]._id;

    const res = await request(app)
      .patch(`/api/v1/notifications/${id}/read`)
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.data.read).toBe(true);

    const updated = await request(app).get('/api/v1/notifications').set(auth());
    expect(updated.body.data.unreadCount).toBe(0);
  });

  it('4. should mark all as read', async () => {
    await request(app).post('/api/v1/todos').set(auth()).send({ text: 'Todo 1' });
    await request(app).post('/api/v1/todos').set(auth()).send({ text: 'Todo 2' });

    const res = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set(auth());

    expect(res.status).toBe(200);

    const updated = await request(app).get('/api/v1/notifications').set(auth());
    expect(updated.body.data.unreadCount).toBe(0);
  });

  it('5. should delete notification', async () => {
    await request(app).post('/api/v1/todos').set(auth()).send({ text: 'Test' });

    const list = await request(app).get('/api/v1/notifications').set(auth());
    const id = list.body.data.notifications[0]._id;

    const res = await request(app)
      .delete(`/api/v1/notifications/${id}`)
      .set(auth());

    expect(res.status).toBe(200);

    const updated = await request(app).get('/api/v1/notifications').set(auth());
    expect(updated.body.data.notifications).toHaveLength(0);
  });
});