import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskHub Pro API',
      version: '1.0.0',
      description: 'TaskHub Pro — MERN SaaS platform with multi-tenancy',
      contact: {
        name: 'bayar35',
        url: 'https://github.com/bayar35/taskhub-pro',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT || 5000}`,
        description: 'Development server',
      },
      {
        url: 'https://taskhub-api-wnu9.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Todos', description: 'Todo CRUD operations' },
      { name: 'Notifications', description: 'Notification endpoints' },
      { name: 'Payments', description: 'Stripe + QPay payments' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);