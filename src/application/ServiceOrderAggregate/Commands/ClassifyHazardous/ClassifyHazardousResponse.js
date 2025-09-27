export class ClassifyHazardousResponse {
  constructor(serviceOrderId, classification, modelMetrics, timestamp) {
    this.serviceOrderId = serviceOrderId;
    this.classification = classification;
    this.modelMetrics = modelMetrics;
    this.timestamp = timestamp;
  }

  toJSON() {
    return {
      serviceOrderId: this.serviceOrderId,
      classification: this.classification,
      modelMetrics: this.modelMetrics,
      timestamp: this.timestamp
    };
  }
}
