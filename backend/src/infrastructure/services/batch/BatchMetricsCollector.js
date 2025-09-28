export class BatchMetricsCollector {
  constructor() {
    this.reset();
  }

  reset() {
    this.metrics = {
      results: [],
      successCount: 0,
      errorCount: 0,
      totalCost: 0,
      mlAnalyzed: 0,
      aiAnalyzed: 0,
      apiCallsUsed: 0,
      startTime: Date.now(),
      endTime: null
    };
  }

  addResult(result) {
    this.metrics.results.push(result);
  }

  incrementSuccess() {
    this.metrics.successCount++;
  }

  incrementError() {
    this.metrics.errorCount++;
  }

  addCost(cost) {
    this.metrics.totalCost += cost || 0;
  }

  incrementMlAnalyzed() {
    this.metrics.mlAnalyzed++;
  }

  incrementAiAnalyzed() {
    this.metrics.aiAnalyzed++;
    this.metrics.apiCallsUsed++;
  }

  markCompleted() {
    this.metrics.endTime = Date.now();
  }

  getProcessingTime() {
    const endTime = this.metrics.endTime || Date.now();
    return endTime - this.metrics.startTime;
  }

  getMetrics() {
    return {
      ...this.metrics,
      processingTime: this.getProcessingTime(),
      averageTimePerOrder: this.metrics.successCount > 0 
        ? this.getProcessingTime() / this.metrics.successCount 
        : 0,
      successRate: this.getTotalProcessed() > 0 
        ? (this.metrics.successCount / this.getTotalProcessed()) * 100 
        : 0,
      costSavings: this.calculateCostSavings()
    };
  }

  getTotalProcessed() {
    return this.metrics.successCount + this.metrics.errorCount;
  }

  calculateCostSavings() {
    const totalAnalyzed = this.metrics.mlAnalyzed + this.metrics.aiAnalyzed;
    if (totalAnalyzed === 0) return 0;
    
    // Assume each AI call costs 1 unit, ML is free
    const potentialCost = totalAnalyzed;
    const actualCost = this.metrics.totalCost;
    return potentialCost - actualCost;
  }

  getSummary() {
    const metrics = this.getMetrics();
    return {
      totalProcessed: this.getTotalProcessed(),
      successRate: `${metrics.successRate.toFixed(1)}%`,
      processingTime: `${(metrics.processingTime / 1000).toFixed(1)}s`,
      costSavings: `${metrics.costSavings} API calls saved`,
      mlVsAi: `${metrics.mlAnalyzed} ML / ${metrics.aiAnalyzed} AI`
    };
  }
}
