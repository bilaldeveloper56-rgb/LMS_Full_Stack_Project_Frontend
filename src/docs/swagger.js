import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from '../config/env.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School ERP + LMS API',
      version: '1.0.0',
      description: 'Production-ready multi-tenant School ERP + LMS SaaS API',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    tags: [
      { name: 'Health' },
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Schools' },
      { name: 'Students' },
      { name: 'Teachers' },
      { name: 'Parents' },
      { name: 'Academics' },
      { name: 'Attendance' },
      { name: 'Assignments' },
      { name: 'Exams' },
      { name: 'Results' },
      { name: 'Fees' },
      { name: 'Subscriptions' },
      { name: 'Notices' },
      { name: 'Notifications' },
      { name: 'Messages' },
      { name: 'Library' },
      { name: 'AI' },
      { name: 'Dashboard' },
      { name: 'Reports' },
      { name: 'Audit Logs' },
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
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app) => {
  if (env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
};
