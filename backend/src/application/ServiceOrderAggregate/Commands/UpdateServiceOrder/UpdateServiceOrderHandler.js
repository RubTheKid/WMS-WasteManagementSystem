import { UpdateServiceOrderCommand } from './UpdateServiceOrderCommand.js';
import { UpdateServiceOrderResponse } from './UpdateServiceOrderResponse.js';
import { ServiceOrderStatus } from '../../../../domain/ServiceOrderAggregate/ServiceOrder.js';

export class UpdateServiceOrderHandler {
  constructor(serviceOrderRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
  }

  async handle(command) {
    try {
      const { serviceOrderId, customerName, companyName, appointmentDate, status, materials } = command;

      // Validate required fields
      if (!serviceOrderId) {
        return new UpdateServiceOrderResponse(false, null, 'Service order ID is required');
      }

      if (!customerName || !companyName) {
        return new UpdateServiceOrderResponse(false, null, 'Customer name and company name are required');
      }

      if (!appointmentDate) {
        return new UpdateServiceOrderResponse(false, null, 'Appointment date is required');
      }

      // Validate status
      if (status && !Object.values(ServiceOrderStatus).includes(status)) {
        return new UpdateServiceOrderResponse(false, null, 'Invalid status');
      }

      // Get existing service order
      const existingOrder = await this.serviceOrderRepository.findById(serviceOrderId);
      if (!existingOrder) {
        return new UpdateServiceOrderResponse(false, null, 'Service order not found');
      }

      // Update service order fields
      existingOrder.customerName = customerName;
      existingOrder.companyName = companyName;
      existingOrder.appointmentDate = new Date(appointmentDate);
      existingOrder.status = status || existingOrder.status;
      existingOrder.updatedAt = new Date();

      // Update materials if provided
      if (materials && Array.isArray(materials)) {
        for (const materialUpdate of materials) {
          if (materialUpdate.id && materialUpdate.internalNotes !== undefined) {
            await this.serviceOrderRepository.updateMaterialNotes(
              materialUpdate.id, 
              materialUpdate.internalNotes
            );
          }
        }
      }

      // Save updated service order
      const updatedOrder = await this.serviceOrderRepository.update(existingOrder);

      return new UpdateServiceOrderResponse(true, updatedOrder);
    } catch (error) {
      console.error('Error updating service order:', error);
      return new UpdateServiceOrderResponse(false, null, error.message);
    }
  }
}
