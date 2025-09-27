import express from 'express';
import authRoutes from './auth.js';
import { createServiceOrderRoutes } from './serviceOrders.js';
import { specs, swaggerUi } from '../../infrastructure/Config/swagger.js';

export function setupRoutes(serviceOrderController) {
    const router = express.Router();

    router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'WMS API Documentation'
    }));
    router.use('/api/auth', authRoutes);
    router.use('/api/v1/service-orders', createServiceOrderRoutes(serviceOrderController));
    router.get('/health', (_, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    return router;
}