export class ProcessBatchCommand {
  constructor(serviceOrders, requestId, timestamp) {
    this.validateServiceOrders(serviceOrders);
    this.validateRequestId(requestId);
    
    this.serviceOrders = serviceOrders;
    this.requestId = requestId;
    this.timestamp = timestamp || new Date().toISOString();
  }

  validateServiceOrders(serviceOrders) {
    if (!serviceOrders || !Array.isArray(serviceOrders)) {
      throw new Error('Service orders must be an array');
    }

    if (serviceOrders.length === 0) {
      throw new Error('Service orders array cannot be empty');
    }

    if (serviceOrders.length > 10000) {
      throw new Error('Maximum 10,000 service orders per batch');
    }

    // Validate each service order structure
    serviceOrders.forEach((serviceOrder, index) => {
      this.validateServiceOrder(serviceOrder, index);
    });
  }

  validateServiceOrder(serviceOrder, index) {
    if (!serviceOrder || typeof serviceOrder !== 'object') {
      throw new Error(`Service order at index ${index} must be an object`);
    }

    const required = ['customerName', 'companyName', 'appointmentDate', 'materials'];
    for (const field of required) {
      if (!serviceOrder[field]) {
        throw new Error(`Service order at index ${index} is missing required field: ${field}`);
      }
    }

    if (!Array.isArray(serviceOrder.materials)) {
      throw new Error(`Service order at index ${index} materials must be an array`);
    }

    if (serviceOrder.materials.length === 0) {
      throw new Error(`Service order at index ${index} must have at least one material`);
    }

    // Validate materials
    serviceOrder.materials.forEach((material, materialIndex) => {
      this.validateMaterial(material, index, materialIndex);
    });

    // Validate appointment date
    const appointmentDate = new Date(serviceOrder.appointmentDate);
    if (isNaN(appointmentDate.getTime())) {
      throw new Error(`Service order at index ${index} has invalid appointmentDate`);
    }

    if (appointmentDate <= new Date()) {
      throw new Error(`Service order at index ${index} appointmentDate cannot be in the past`);
    }
  }

  validateMaterial(material, serviceOrderIndex, materialIndex) {
    if (!material || typeof material !== 'object') {
      throw new Error(`Material at service order ${serviceOrderIndex}, material ${materialIndex} must be an object`);
    }

    const required = ['product', 'description'];
    for (const field of required) {
      if (!material[field]) {
        throw new Error(`Material at service order ${serviceOrderIndex}, material ${materialIndex} is missing required field: ${field}`);
      }
    }
  }

  validateRequestId(requestId) {
    if (!requestId || typeof requestId !== 'string' || requestId.trim().length === 0) {
      throw new Error('Request ID is required and must be a non-empty string');
    }
  }
}
