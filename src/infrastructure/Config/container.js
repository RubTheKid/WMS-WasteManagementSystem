import { ServiceOrderRepository } from '../repositories/ServiceOrderRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

import { MaterialAnalysisService } from '../services/MaterialAnalysisService.js';
import { HazardousClassificationService } from '../services/HazardousClassificationService.js';

import { MaterialAnalysisPublisher } from '../messageBroker/MaterialAnalysis/MaterialAnalysisPublisher.js';
import { MaterialAnalysisConsumer } from '../messageBroker/MaterialAnalysis/MaterialAnalysisConsumer.js';

import { CreateServiceOrderHandler } from '../../application/ServiceOrderAggregate/Commands/CreateServiceOrder/CreateServiceOrderHandler.js';
import { GetAllServiceOrdersHandler } from '../../application/ServiceOrderAggregate/Queries/GetAllServiceOrders/GetAllServiceOrdersHandler.js';
import { ClassifyHazardousHandler } from '../../application/ServiceOrderAggregate/Commands/ClassifyHazardous/ClassifyHazardousHandler.js';
import { TriggerAnalysisHandler } from '../../application/ServiceOrderAggregate/Commands/TriggerAnalysis/TriggerAnalysisHandler.js';
import { LoginHandler } from '../../application/UserAggregate/Commands/Login/LoginHandler.js';
import { VerifyTokenHandler } from '../../application/UserAggregate/Commands/VerifyToken/VerifyTokenHandler.js';

import { MaterialAnalysisScheduler } from '../messageBroker/MaterialAnalysis/MaterialAnalysisScheduler.js';

import { ServiceOrderController } from '../../api/controllers/ServiceOrderController.js';
import { AuthController } from '../../api/controllers/AuthController.js';

export class Container {
    constructor() {
        this.services = new Map();
    }

    async initialize() {
        // Repositories
        this.services.set('serviceOrderRepository', new ServiceOrderRepository());
        this.services.set('userRepository', new UserRepository());

        // Services
        this.services.set('materialAnalysisService', new MaterialAnalysisService());
        this.services.set('hazardousClassificationService', new HazardousClassificationService());

        // Message Broker
        const materialAnalysisPublisher = new MaterialAnalysisPublisher();
        this.services.set('materialAnalysisPublisher', materialAnalysisPublisher);

        // Command Handlers
        const createServiceOrderHandler = new CreateServiceOrderHandler(
            this.services.get('serviceOrderRepository'),
            this.services.get('materialAnalysisPublisher')
        );
        this.services.set('createServiceOrderHandler', createServiceOrderHandler);

        const classifyHazardousHandler = new ClassifyHazardousHandler(
            this.services.get('serviceOrderRepository'),
            this.services.get('hazardousClassificationService')
        );
        this.services.set('classifyHazardousHandler', classifyHazardousHandler);

        const triggerAnalysisHandler = new TriggerAnalysisHandler(
            this.services.get('materialAnalysisScheduler')
        );
        this.services.set('triggerAnalysisHandler', triggerAnalysisHandler);

        const loginHandler = new LoginHandler(
            this.services.get('userRepository'),
            process.env.JWT_SECRET || 'your-secret-key',
            process.env.JWT_EXPIRES_IN || '24h'
        );
        this.services.set('loginHandler', loginHandler);

        const verifyTokenHandler = new VerifyTokenHandler(
            this.services.get('userRepository'),
            process.env.JWT_SECRET || 'your-secret-key'
        );
        this.services.set('verifyTokenHandler', verifyTokenHandler);

        // Query Handlers
        const getAllServiceOrdersHandler = new GetAllServiceOrdersHandler(
            this.services.get('serviceOrderRepository')
        );
        this.services.set('getAllServiceOrdersHandler', getAllServiceOrdersHandler);

        // Scheduler
        const materialAnalysisScheduler = new MaterialAnalysisScheduler(
            this.services.get('serviceOrderRepository'),
            this.services.get('materialAnalysisPublisher')
        );
        this.services.set('materialAnalysisScheduler', materialAnalysisScheduler);

        // Controllers
        const serviceOrderController = new ServiceOrderController(
            this.services.get('createServiceOrderHandler'),
            this.services.get('getAllServiceOrdersHandler'),
            this.services.get('triggerAnalysisHandler'),
            this.services.get('classifyHazardousHandler')
        );
        this.services.set('serviceOrderController', serviceOrderController);

        const authController = new AuthController(
            this.services.get('loginHandler'),
            this.services.get('verifyTokenHandler')
        );
        this.services.set('authController', authController);

        // Consumer
        const materialAnalysisConsumer = new MaterialAnalysisConsumer(
            this.services.get('materialAnalysisService'),
            this.services.get('serviceOrderRepository')
        );
        this.services.set('materialAnalysisConsumer', materialAnalysisConsumer);
    }

    async startConsumers() {
        const consumer = this.services.get('materialAnalysisConsumer');
        await consumer.start();
    }

    async startScheduler() {
        const scheduler = this.services.get('materialAnalysisScheduler');
        scheduler.start();
    }

    get(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} not found in container`);
        }
        return service;
    }
}