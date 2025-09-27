import { ServiceOrder, ServiceOrderStatus } from '../../../../domain/ServiceOrderAggregate/ServiceOrder.js';
import { Material } from '../../../../domain/ServiceOrderAggregate/Material.js';
import { CreateServiceOrderResponse } from './CreateServiceOrderResponse.js';
import { MaterialAnalysisPublisher } from '../../../../infrastructure/messageBroker/MaterialAnalysis/MaterialAnalysisPublisher.js';

export class CreateServiceOrderHandler {
  constructor(serviceOrderRepository, materialAnalysisPublisher) {
    this.serviceOrderRepository = serviceOrderRepository;
    this.materialAnalysisPublisher = materialAnalysisPublisher;
  }

  async handle(command) {
    try {
      if (!Array.isArray(command.materials)) {
        throw new Error('Materials must be an array');
      }

      command.materials.forEach(m => {
        if (!m.description || !m.product) {
          throw new Error('Each material must have a description and product');
        }
      });

      const appointmentDate = command.appointmentDate instanceof Date
        ? command.appointmentDate
        : new Date(command.appointmentDate);

      const materials = command.materials.map(m => new Material(
        null,
        m.description,
        m.product
      ));


      const serviceOrder = new ServiceOrder(
        null,
        command.customerName,
        command.companyName,
        appointmentDate,
        ServiceOrderStatus.SCHEDULED,
        new Date(),
        new Date(),
        materials
      );

      const savedOrder = await this.serviceOrderRepository.save(serviceOrder);

      await this.materialAnalysisPublisher.publishMaterials(savedOrder.id, savedOrder.materials);

      return new CreateServiceOrderResponse(
        savedOrder.id,
        savedOrder.customerName,
        savedOrder.companyName,
        savedOrder.appointmentDate,
        savedOrder.status,
        savedOrder.materials
      );
    } catch (error) {
      console.error('CreateServiceOrderHandler error:', error);

      throw error;
    }
  }
}