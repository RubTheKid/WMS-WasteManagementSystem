export class BatchOrchestrator {
  constructor(batchSize = 50, concurrentBatches = 2) {
    this.batchSize = batchSize;
    this.concurrentBatches = concurrentBatches;
  }

  createBatches(serviceOrders, batchSize = this.batchSize) {
    const batches = [];
    for (let i = 0; i < serviceOrders.length; i += batchSize) {
      batches.push(serviceOrders.slice(i, i + batchSize));
    }
    return batches;
  }

  async processBatches(serviceOrders, serviceOrderProcessor, rateLimitManager, metricsCollector, progressCallback) {
    console.log(`Starting batch processing for ${serviceOrders.length} service orders`);
    
    const batches = this.createBatches(serviceOrders);
    console.log(`Created ${batches.length} batches of max ${this.batchSize} service orders each`);

    let processedCount = 0;
    
    // process batches in groups with controlled concurrency
    for (let i = 0; i < batches.length; i += this.concurrentBatches) {
      const concurrentBatches = batches.slice(i, i + this.concurrentBatches);
      
      const batchPromises = concurrentBatches.map(batch => 
        serviceOrderProcessor.processBatch(batch, rateLimitManager, metricsCollector)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
    
      for (const batchResult of batchResults) {
        if (batchResult.status === 'fulfilled') {
          processedCount += batchResult.value.length;
        } else {
          console.error('Batch processing error:', batchResult.reason);
        }
      }
      
      if (progressCallback) {
        progressCallback({
          processedCount,
          totalCount: serviceOrders.length,
          percentage: Math.round((processedCount / serviceOrders.length) * 100),
          batchesCompleted: Math.min(i + this.concurrentBatches, batches.length),
          totalBatches: batches.length
        });
      }
      
      console.log(`Processed ${processedCount}/${serviceOrders.length} service orders (${Math.round((processedCount / serviceOrders.length) * 100)}%)`);
    }
    
    metricsCollector.markCompleted();
    
    return {
      totalProcessed: processedCount,
      metrics: metricsCollector.getMetrics(),
      summary: metricsCollector.getSummary()
    };
  }

  getBatchingStats(serviceOrders) {
    const batches = this.createBatches(serviceOrders);
    
    return {
      totalServiceOrders: serviceOrders.length,
      totalBatches: batches.length,
      batchSize: this.batchSize,
      concurrentBatches: this.concurrentBatches,
      estimatedProcessingTime: this.estimateProcessingTime(serviceOrders.length),
      lastBatchSize: batches.length > 0 ? batches[batches.length - 1].length : 0
    };
  }

  estimateProcessingTime(totalServiceOrders) {
    // rough estimation: ~1 second per service order with rate limiting
    const estimatedSeconds = Math.ceil(totalServiceOrders / 10); // assuming 10 orders per second average
    
    return {
      seconds: estimatedSeconds,
      minutes: Math.ceil(estimatedSeconds / 60),
      formatted: estimatedSeconds < 60 
        ? `${estimatedSeconds} seconds`
        : `${Math.ceil(estimatedSeconds / 60)} minutes`
    };
  }
}
