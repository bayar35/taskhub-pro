import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from './env';
import { logger } from './logger';
import { verifyAccessToken } from '../utils/jwt';

let io: Server;

export function initSocket(server: HTTPServer): Server {
  // CORS-д зориулсан зөвшөөрөгдөх домэйнуудын жагсаалт
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://taskhub-pro-sooty.vercel.app',
  ];

  // Хэрэв env.CLIENT_URL байвал жагсаалтад нэмэх
  if (env.CLIENT_URL && !allowedOrigins.includes(env.CLIENT_URL)) {
    allowedOrigins.push(env.CLIENT_URL);
  }

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Хэрэв origin байхгүй бол (жишээ нь mobile app) зөвшөөрөх
        if (!origin) return callback(null, true);
        
        // Хэрэв origin зөвшөөрөгдсөн жагсаалтад байвал зөвшөөрөх
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Бусад тохиолдолд алдаа буцаах
        logger.warn(`CORS-д хориглосон origin: ${origin}`);
        return callback(new Error('CORS policy: Origin not allowed'));
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // Render-ийн урт холболтыг дэмжих тохиргоо
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
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

    // Хэрэглэгчийн өрөөнд нэгдэх
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