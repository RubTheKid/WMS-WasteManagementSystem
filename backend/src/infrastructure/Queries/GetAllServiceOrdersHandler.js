import { GetAllServiceOrdersResponse } from './GetAllServiceOrdersResponse.js';

export class GetAllServiceOrdersHandler {
    constructor(serviceOrderRepository) {
        this.serviceOrderRepository = serviceOrderRepository;
    }

    async handle(query) {
        try {
            const serviceOrders = await this.serviceOrderRepository.findAll(query.filters);

            return new GetAllServiceOrdersResponse(serviceOrders);
        } catch (error) {
            console.error('GetAllServiceOrdersHandler error:', error);
            throw error;
        }
    }
}
