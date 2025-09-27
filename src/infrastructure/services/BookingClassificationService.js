import { HybridClassificationService } from '../../application/ClassificationAggregate/Services/HybridClassificationService.js';

export class ServiceOrderClassificationService {
  constructor() {
    this.hybridService = new HybridClassificationService();
  }

  classifyServiceOrder(so) {
    return this.hybridService.classifyServiceOrder(so);
  }

  classifyServiceOrders(so) {
    return this.hybridService.classifyServiceOrders(so);
  }

  retrainClassifier() {
    this.hybridService.retrainClassifier();
  }
}