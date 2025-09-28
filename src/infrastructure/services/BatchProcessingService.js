import { RateLimitManager } from './batch/RateLimitManager.js';
import { BatchMetricsCollector } from './batch/BatchMetricsCollector.js';
import { ServiceOrderProcessor } from './batch/ServiceOrderProcessor.js';
import { BatchOrchestrator } from './batch/BatchOrchestrator.js';


export class BatchProcessingService {
  constructor(serviceOrderRepository, materialAnalysisService) {
    // Initialize specialized components
    this.rateLimitManager = new RateLimitManager(100); // 100 API calls per second
    this.metricsCollector = new BatchMetricsCollector();
    this.serviceOrderProcessor = new ServiceOrderProcessor(serviceOrderRepository, materialAnalysisService);
    this.batchOrchestrator = new BatchOrchestrator(50, 2); // 50 per batch, 2 concurrent
    this.serviceOrderRepository = serviceOrderRepository;
    this.materialAnalysisService = materialAnalysisService;
  }


  async processBatch(serviceOrders, requestId, progressCallback) {
    console.log(`🚀 BatchProcessingService: Starting batch ${requestId} with ${serviceOrders.length} service orders`);
    
    // reset metrics for this batch
    this.metricsCollector.reset();
    
    try {
      // use orchestrator to handle the complex batch processing
      const result = await this.batchOrchestrator.processBatches(
        serviceOrders,
        this.serviceOrderProcessor,
        this.rateLimitManager,
        this.metricsCollector,
        progressCallback
      );
      
      console.log(`Batch ${requestId} completed:`, result.summary);
      s
      return {
        requestId,
        status: 'COMPLETED',
        ...result
      };
      
    } catch (error) {
      console.error(`Batch ${requestId} failed:`, error);
      
      return {
        requestId,
        status: 'FAILED',
        error: error.message,
        metrics: this.metricsCollector.getMetrics()
      };
    }
  }


  getProcessingStatus(requestId) {
    return {
      requestId,
      metrics: this.metricsCollector.getMetrics(),
      rateLimitStats: this.rateLimitManager.getRateLimitStats(),
      summary: this.metricsCollector.getSummary()
    };
  }


  getProcessingMetrics() {
    return {
      currentBatch: this.metricsCollector.getMetrics(),
      rateLimiting: this.rateLimitManager.getRateLimitStats(),
      summary: this.metricsCollector.getSummary()
    };
  }


  getBatchingInfo(serviceOrders) {
    return this.batchOrchestrator.getBatchingStats(serviceOrders);
  }


  reset() {
    this.metricsCollector.reset();
    this.rateLimitManager.reset();
  }

  // backward compatibility methods (if needed)
  
  async processSingleBatch(serviceOrdersBatch, requestId) {
    return await this.serviceOrderProcessor.processBatch(
      serviceOrdersBatch, 
      this.rateLimitManager, 
      this.metricsCollector
    );
  }

  createBatches(serviceOrders, batchSize) {
    return this.batchOrchestrator.createBatches(serviceOrders, batchSize);
  }

  async rateLimitApiCall() {
    return await this.rateLimitManager.rateLimitApiCall();
  }

  getRateLimitStats() {
    return this.rateLimitManager.getRateLimitStats();
  }
}
