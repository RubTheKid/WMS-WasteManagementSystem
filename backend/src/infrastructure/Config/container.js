import { ServiceOrderRepository } from '../repositories/ServiceOrderRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { BatchRequestRepository } from '../repositories/BatchRequestRepository.js';

import { MaterialAnalysisService } from '../services/MaterialAnalysisService.js';
import { MLAnalysisService } from '../services/MLAnalysisService.js';
import { BatchProcessingService } from '../services/BatchProcessingService.js';

import { MaterialAnalysisPublisher } from '../messageBroker/MaterialAnalysis/MaterialAnalysisPublisher.js';
import { MaterialAnalysisConsumer } from '../messageBroker/MaterialAnalysis/MaterialAnalysisConsumer.js';
import { BatchProcessingPublisher } from '../messageBroker/BatchProcessing/BatchProcessingPublisher.js';
import { BatchProcessingConsumer } from '../messageBroker/BatchProcessing/BatchProcessingConsumer.js';

import { CreateServiceOrderHandler } from '../../application/ServiceOrderAggregate/Commands/CreateServiceOrder/CreateServiceOrderHandler.js';
import { GetAllServiceOrdersHandler } from '../../application/ServiceOrderAggregate/Queries/GetAllServiceOrders/GetAllServiceOrdersHandler.js';
import { ClassifyHazardousHandler } from '../../application/ServiceOrderAggregate/Commands/ClassifyHazardous/ClassifyHazardousHandler.js';
import { TriggerAnalysisHandler } from '../../application/ServiceOrderAggregate/Commands/TriggerAnalysis/TriggerAnalysisHandler.js';
import { UpdateServiceOrderHandler } from '../../application/ServiceOrderAggregate/Commands/UpdateServiceOrder/UpdateServiceOrderHandler.js';
import { LoginHandler } from '../../application/UserAggregate/Commands/Login/LoginHandler.js';
import { VerifyTokenHandler } from '../../application/UserAggregate/Commands/VerifyToken/VerifyTokenHandler.js';

import { ProcessBatchHandler } from '../../application/ServiceOrderAggregate/Commands/ProcessBatch/ProcessBatchHandler.js';

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
        this.services.set('batchRequestRepository', new BatchRequestRepository());

        // Services
        this.services.set('materialAnalysisService', new MaterialAnalysisService());
        this.services.set('mlAnalysisService', new MLAnalysisService());
        this.services.set('batchProcessingService', new BatchProcessingService(
            this.services.get('serviceOrderRepository'),
            this.services.get('materialAnalysisService')
        ));

        // broker
        const materialAnalysisPublisher = new MaterialAnalysisPublisher();
        this.services.set('materialAnalysisPublisher', materialAnalysisPublisher);
        
        const batchProcessingPublisher = new BatchProcessingPublisher();
        this.services.set('batchProcessingPublisher', batchProcessingPublisher);

        const createServiceOrderHandler = new CreateServiceOrderHandler(
            this.services.get('serviceOrderRepository'),
            this.services.get('materialAnalysisPublisher')
        );
        this.services.set('createServiceOrderHandler', createServiceOrderHandler);

        const classifyHazardousHandler = new ClassifyHazardousHandler(
            this.services.get('serviceOrderRepository'),
            this.services.get('mlAnalysisService'),
            this.services.get('materialAnalysisService')
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

        const processBatchHandler = new ProcessBatchHandler(
            this.services.get('batchRequestRepository'),
            this.services.get('batchProcessingPublisher')
        );
        this.services.set('processBatchHandler', processBatchHandler);

        const getAllServiceOrdersHandler = new GetAllServiceOrdersHandler(
            this.services.get('serviceOrderRepository')
        );
        this.services.set('getAllServiceOrdersHandler', getAllServiceOrdersHandler);

        const updateServiceOrderHandler = new UpdateServiceOrderHandler(
            this.services.get('serviceOrderRepository')
        );
        this.services.set('updateServiceOrderHandler', updateServiceOrderHandler);

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
            this.services.get('classifyHazardousHandler'),
            this.services.get('processBatchHandler'),
            this.services.get('updateServiceOrderHandler')
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
        
        const batchProcessingConsumer = new BatchProcessingConsumer(
            this.services.get('serviceOrderRepository'),
            this.services.get('materialAnalysisService'),
            this.services.get('batchRequestRepository')
        );
        this.services.set('batchProcessingConsumer', batchProcessingConsumer);
    }

    async startConsumers() {
        const materialAnalysisConsumer = this.services.get('materialAnalysisConsumer');
        await materialAnalysisConsumer.start();
        
        const batchProcessingConsumer = this.services.get('batchProcessingConsumer');
        await batchProcessingConsumer.start();
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