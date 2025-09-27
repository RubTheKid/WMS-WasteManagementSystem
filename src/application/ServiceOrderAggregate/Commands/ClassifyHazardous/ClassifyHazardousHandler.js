import { ClassifyHazardousResponse } from './ClassifyHazardousResponse.js';

export class ClassifyHazardousHandler {
  constructor(serviceOrderRepository, hazardousClassificationService) {
    this.serviceOrderRepository = serviceOrderRepository;
    this.hazardousClassificationService = hazardousClassificationService;
  }

  async handle(command) {
    try {
      const serviceOrder = await this.serviceOrderRepository.findById(command.serviceOrderId);
      
      if (!serviceOrder) {
        throw new Error('Service order not found');
      }

      const classificationResult = this.hazardousClassificationService.classifyServiceOrder(serviceOrder);
      
      return new ClassifyHazardousResponse(
        command.serviceOrderId,
        classificationResult.toJSON(),
        this.hazardousClassificationService.getModelMetrics(),
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error in ClassifyHazardousHandler:', error);
      throw error;
    }
  }
}
