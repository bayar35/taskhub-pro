import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env';
import { logger } from './logger';
import { verifyAccessToken } from '../utils/jwt';

let io: Server;

export function initSocket(server: HTTPServer): Server {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.warn('Socket authentication алга');
      return next(new Error('Authentication error'));
    }

    try {
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info(`Socket холбогдлоо: ${socket.id} (user: ${userId})`);

    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      logger.info(`Socket салсан: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io эхлээгүй байна');
  }
  return io;
}