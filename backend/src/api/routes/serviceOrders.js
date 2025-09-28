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
     * /api/v1/service-orders/{id}:
     *   put:
     *     summary: Update a service order
     *     description: Update service order details including appointment date, status, and material notes
     *     tags: [Service Orders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Service order ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - customerName
     *               - companyName
     *               - appointmentDate
     *             properties:
     *               customerName:
     *                 type: string
     *                 example: "John Doe"
     *               companyName:
     *                 type: string
     *                 example: "Acme Corp"
     *               appointmentDate:
     *                 type: string
     *                 format: date-time
     *                 example: "2024-12-01T10:00:00Z"
     *               status:
     *                 type: string
     *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
     *                 example: "SCHEDULED"
     *               materials:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: "123"
     *                     internalNotes:
     *                       type: string
     *                       example: "Additional notes about this material"
     *     responses:
     *       200:
     *         description: Service order updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ServiceOrder'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Service order not found
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
    router.put('/:id', authMiddleware.requireEmployee, serviceOrderController.updateServiceOrder.bind(serviceOrderController));

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
     * /api/v1/service-orders/batch/process:
     *   post:
     *     summary: Process batch of service orders
     *     description: Process multiple service orders with ML-first analysis and rate limiting
     *     tags: [Batch Processing]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - serviceOrders
     *             properties:
     *               serviceOrders:
     *                 type: array
     *                 maxItems: 10000
     *                 items:
     *                   type: object
     *                   required:
     *                     - customerName
     *                     - companyName
     *                     - appointmentDate
     *                     - materials
     *                   properties:
     *                     customerName:
     *                       type: string
     *                       example: "John Doe"
     *                     companyName:
     *                       type: string
     *                       example: "Acme Corp"
     *                     appointmentDate:
     *                       type: string
     *                       format: date-time
     *                       example: "2024-12-01T10:00:00Z"
     *                     materials:
     *                       type: array
     *                       minItems: 1
     *                       items:
     *                         type: object
     *                         required:
     *                           - product
     *                           - description
     *                         properties:
     *                           product:
     *                             type: string
     *                             example: "BATTERIES"
     *                           description:
     *                             type: string
     *                             example: "Old laptop batteries"
     *     responses:
     *       200:
     *         description: Batch processing completed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 requestId:
     *                   type: string
     *                   example: "batch_1640995200000"
     *                 status:
     *                   type: string
     *                   enum: [COMPLETED, IN_PROGRESS, FAILED]
     *                 progress:
     *                   type: object
     *                   properties:
     *                     totalServiceOrders:
     *                       type: integer
     *                       example: 100
     *                     processedCount:
     *                       type: integer
     *                       example: 100
     *                     percentage:
     *                       type: integer
     *                       example: 100
     *                 results:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       serviceOrderId:
     *                         type: string
     *                       status:
     *                         type: string
     *                         enum: [SUCCESS, ERROR]
     *                       materialsAnalyzed:
     *                         type: integer
     *                       cost:
     *                         type: number
     *                       mlAnalyzed:
     *                         type: integer
     *                       aiAnalyzed:
     *                         type: integer
     *                 metrics:
     *                   type: object
     *                   properties:
     *                     processingTime:
     *                       type: integer
     *                       description: Processing time in milliseconds
     *                     successRate:
     *                       type: integer
     *                       description: Success rate percentage
     *                     costMetrics:
     *                       type: object
     *                       properties:
     *                         totalCost:
     *                           type: number
     *                         costSavings:
     *                           type: string
     *                     performanceMetrics:
     *                       type: object
     *                       properties:
     *                         serviceOrdersPerSecond:
     *                           type: number
     *                         apiCallsPerSecond:
     *                           type: number
     *       400:
     *         description: Invalid request data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
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
    router.post('/batch', authMiddleware.authenticate, authMiddleware.requireAdmin, serviceOrderController.processBatch.bind(serviceOrderController));

    /**
     * @swagger
     * /api/v1/service-orders/batch/status/{requestId}:
     *   get:
     *     summary: Get batch processing status
     *     description: Get the current status of a batch processing request
     *     tags: [Batch Processing]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: requestId
     *         required: true
     *         schema:
     *           type: string
     *         description: Batch processing request ID
     *         example: "batch_1640995200000"
     *     responses:
     *       200:
     *         description: Status retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 requestId:
     *                   type: string
     *                 status:
     *                   type: string
     *                   enum: [INITIALIZING, IN_PROGRESS, COMPLETED, FAILED]
     *                 progress:
     *                   type: object
     *                   properties:
     *                     totalServiceOrders:
     *                       type: integer
     *                     processedCount:
     *                       type: integer
     *                     percentage:
     *                       type: integer
     *                 processingTime:
     *                   type: integer
     *                   description: Processing time in milliseconds
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *       404:
     *         description: Processing request not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Authentication required
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
    router.get('/batch/status/:requestId', authMiddleware.authenticate, authMiddleware.requireEmployee, serviceOrderController.getProcessingStatus.bind(serviceOrderController));

    /**
     * @swagger
     * /api/v1/service-orders/batch/metrics:
     *   get:
     *     summary: Get batch processing metrics
     *     description: Get overall metrics for batch processing operations
     *     tags: [Batch Processing]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Metrics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 activeProcesses:
     *                   type: integer
     *                 completedProcesses:
     *                   type: integer
     *                 failedProcesses:
     *                   type: integer
     *                 totalProcesses:
     *                   type: integer
     *                 averageProcessingTime:
     *                   type: number
     *                 totalServiceOrdersProcessed:
     *                   type: integer
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
    router.get('/batch/metrics', authMiddleware.authenticate, authMiddleware.requireAdmin, serviceOrderController.getProcessingMetrics.bind(serviceOrderController));

    return router;
}