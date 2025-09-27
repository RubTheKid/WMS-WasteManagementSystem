import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware.js';

export function createServiceOrderRoutes(serviceOrderController) {
    const router = express.Router();
    const authMiddleware = new AuthMiddleware();

    /**
     * @swagger
     * /api/v1/service-orders:
     *   post:
     *     summary: Create a new service order
     *     description: Create a new service order for waste collection
     *     tags: [Service Orders]
     *     security: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateServiceOrderRequest'
     *     responses:
     *       201:
     *         description: Service order created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ServiceOrder'
     *       400:
     *         description: Invalid request data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/', serviceOrderController.createServiceOrder.bind(serviceOrderController));

    // others service order routes require auth
    router.use(authMiddleware.authenticate);

    /**
     * @swagger
     * /api/v1/service-orders:
     *   get:
     *     summary: Get all service orders
     *     description: Retrieve all service orders with optional filtering
     *     tags: [Service Orders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
     *         description: Filter by service order status
     *     responses:
     *       200:
     *         description: Service orders retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ServiceOrdersResponse'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       403:
     *         description: Employee or admin access required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.get('/', authMiddleware.requireEmployee, serviceOrderController.getAllServiceOrders.bind(serviceOrderController));


    /**
     * @swagger
     * /api/v1/service-orders/analyze:
     *   post:
     *     summary: Trigger material analysis
     *     description: Manually trigger AI analysis of unanalyzed materials
     *     tags: [Service Orders]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Analysis triggered successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Material analysis process triggered successfully
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       403:
     *         description: Admin access required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/analyze', authMiddleware.requireEmployee, serviceOrderController.triggerAnalysis.bind(serviceOrderController));

    return router;
}
