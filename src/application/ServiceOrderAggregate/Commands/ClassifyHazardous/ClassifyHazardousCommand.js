export class ClassifyHazardousCommand {
  constructor(serviceOrderId) {
    this.validateServiceOrderId(serviceOrderId);
    this.serviceOrderId = serviceOrderId;
  }

  validateServiceOrderId(serviceOrderId) {
    if (!serviceOrderId || typeof serviceOrderId !== 'string' || serviceOrderId.trim().length === 0) {
      throw new Error('Service order ID is required and must be a non-empty string');
    }
  }
}
