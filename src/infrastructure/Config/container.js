import { ServiceOrderRepository } from '../repositories/ServiceOrderRepository.js';

import { MaterialAnalysisService } from '../services/MaterialAnalysisService.js';

import { MaterialAnalysisPublisher } from '../messageBroker/MaterialAnalysis/MaterialAnalysisPublisher.js';
import { MaterialAnalysisConsumer } from '../messageBroker/MaterialAnalysis/MaterialAnalysisConsumer.js';

import { CreateServiceOrderHandler } from '../../application/ServiceOrderAggregate/Commands/CreateServiceOrder/CreateServiceOrderHandler.js';
import { GetAllServiceOrdersHandler } from '../../application/ServiceOrderAggregate/Queries/GetAllServiceOrders/GetAllServiceOrdersHandler.js';

import { MaterialAnalysisScheduler } from '../messageBroker/MaterialAnalysis/MaterialAnalysisScheduler.js';

import { ServiceOrderController } from '../../api/controllers/ServiceOrderController.js';

export class Container {
    constructor() {
        this.services = new Map();
    }

    async initialize() {
        // Repositories
        this.services.set('serviceOrderRepository', new ServiceOrderRepository());

        // Services
        this.services.set('materialAnalysisService', new MaterialAnalysisService());

        // Message Broker
        const materialAnalysisPublisher = new MaterialAnalysisPublisher();
        this.services.set('materialAnalysisPublisher', materialAnalysisPublisher);

        // Command Handlers
        const createServiceOrderHandler = new CreateServiceOrderHandler(
            this.services.get('serviceOrderRepository'),
            this.services.get('materialAnalysisPublisher')
        );
        this.services.set('createServiceOrderHandler', createServiceOrderHandler);

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
            this.services.get('materialAnalysisScheduler')
        );
        this.services.set('serviceOrderController', serviceOrderController);

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