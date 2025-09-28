export class UpdateServiceOrderResponse {
  constructor(success, serviceOrder = null, error = null) {
    this.success = success;
    this.serviceOrder = serviceOrder;
    this.error = error;
  }
}