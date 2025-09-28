import { ProcessBatchResponse } from './ProcessBatchResponse.js';

export class ProcessBatchHandler {
  constructor(batchRequestRepository, batchProcessingPublisher) {
    this.batchRequestRepository = batchRequestRepository;
    this.batchProcessingPublisher = batchProcessingPublisher;
  }

  async handle(command) {
    try {
      console.log(`📝 Creating batch request ${command.requestId} for ${command.serviceOrders.length} service orders`);
      
      // Create batch request record in database
      await this.batchRequestRepository.create(command.requestId, command.serviceOrders.length);
      
      // Publish to RabbitMQ for async processing
      await this.batchProcessingPublisher.publishBatch(command.requestId, command.serviceOrders);
      
      console.log(`✅ Batch ${command.requestId} published to RabbitMQ successfully`);

      return {
        requestId: command.requestId,
        status: 'ACCEPTED',
        totalServiceOrders: command.serviceOrders.length,
        timestamp: command.timestamp
      };

    } catch (error) {
      console.error(`❌ Error handling batch request ${command.requestId}:`, error);
      
      // Try to update batch status to failed
      try {
        await this.batchRequestRepository.updateStatus(command.requestId, 'FAILED', {
          error_message: error.message,
          completed_at: new Date()
        });
      } catch (updateError) {
        console.error('❌ Error updating batch status to FAILED:', updateError);
      }
      
      throw error;
    }
  }

  async getStatus(requestId) {
    return await this.batchRequestRepository.getStatus(requestId);
  }

  async getMetrics() {
    return await this.batchRequestRepository.getMetrics();
  }

}
