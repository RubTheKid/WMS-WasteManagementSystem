export class ProcessBatchResponse {
  constructor(requestId, totalServiceOrders, processedCount, results, metrics, status, timestamp) {
    this.requestId = requestId;
    this.totalServiceOrders = totalServiceOrders;
    this.processedCount = processedCount;
    this.results = results;
    this.metrics = metrics;
    this.status = status;
    this.timestamp = timestamp;
  }

  static createInProgress(requestId, totalServiceOrders, processedCount, timestamp) {
    return new ProcessBatchResponse(
      requestId,
      totalServiceOrders,
      processedCount,
      [],
      null,
      'IN_PROGRESS',
      timestamp
    );
  }

  static createCompleted(requestId, totalServiceOrders, results, metrics, timestamp) {
    return new ProcessBatchResponse(
      requestId,
      totalServiceOrders,
      results.length,
      results,
      metrics,
      'COMPLETED',
      timestamp
    );
  }

  static createFailed(requestId, totalServiceOrders, processedCount, error, timestamp) {
    return new ProcessBatchResponse(
      requestId,
      totalServiceOrders,
      processedCount,
      [],
      {
        error: error.message,
        errorType: error.constructor.name
      },
      'FAILED',
      timestamp
    );
  }

  toJSON() {
    return {
      requestId: this.requestId,
      status: this.status,
      progress: {
        totalServiceOrders: this.totalServiceOrders,
        processedCount: this.processedCount,
        percentage: Math.round((this.processedCount / this.totalServiceOrders) * 100)
      },
      results: this.results,
      metrics: this.metrics,
      timestamp: this.timestamp
    };
  }
}
