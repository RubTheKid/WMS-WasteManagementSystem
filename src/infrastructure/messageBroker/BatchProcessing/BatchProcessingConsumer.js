import amqp from 'amqplib';
import { ServiceOrder, ServiceOrderStatus } from '../../../domain/ServiceOrderAggregate/ServiceOrder.js';
import { Material } from '../../../domain/ServiceOrderAggregate/Material.js';

export class BatchProcessingConsumer {
  constructor(serviceOrderRepository, materialAnalysisService, batchRequestRepository) {
    this.serviceOrderRepository = serviceOrderRepository;
    this.materialAnalysisService = materialAnalysisService;
    this.batchRequestRepository = batchRequestRepository;
    this.connection = null;
    this.channel = null;
    this.queue = 'batch-processing';
    this.isProcessing = false;
  }

  async start() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@wms-rabbitmq:5672';
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Assert queue
      await this.channel.assertQueue(this.queue, { durable: true });
      
      // process one message at a time
      this.channel.prefetch(1);
      
      console.log('✅ BatchProcessingConsumer connected and waiting for messages...');
      
      this.channel.consume(this.queue, async (msg) => {
        if (msg) {
          await this.processMessage(msg);
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to start BatchProcessingConsumer:', error);
      throw error;
    }
  }

  async processMessage(msg) {
    const startTime = Date.now();
    let batchData;
    
    try {
      batchData = JSON.parse(msg.content.toString());
      const { requestId, serviceOrders } = batchData;
      
      console.log(`Processing batch ${requestId} with ${serviceOrders.length} service orders`);
      
      await this.batchRequestRepository.updateStatus(requestId, 'IN_PROGRESS', {
        started_at: new Date()
      });

      let successCount = 0;
      let failedCount = 0;
      const errors = [];

      // Process each service order
      for (let i = 0; i < serviceOrders.length; i++) {
        const serviceOrderData = serviceOrders[i];
        
        try {
          const appointmentDate = new Date(serviceOrderData.appointmentDate);
          
          const materials = serviceOrderData.materials.map(m => new Material(
            null,
            m.description,
            m.product
          ));

          const serviceOrder = new ServiceOrder(
            null,
            serviceOrderData.customerName,
            serviceOrderData.companyName,
            appointmentDate,
            ServiceOrderStatus.SCHEDULED,
            new Date(),
            new Date(),
            materials
          );

          const savedServiceOrder = await this.serviceOrderRepository.save(serviceOrder);
          
          // Process materials with rate limiting
          for (const material of savedServiceOrder.materials) {
            try {
              const analysisResult = await this.materialAnalysisService.analyzeMaterial(material);
              
              console.log(`Analysis result for material ${material.id}:`, {
                isHazardous: analysisResult.isHazardous,
                aiClassification: analysisResult.aiClassification,
                classificationCode: analysisResult.classificationCode,
                riskLevel: analysisResult.riskLevel,
                source: analysisResult.source
              });
              
              // Update material in database
              if (material.id) {
                console.log(`Saving to database: material ${material.id} with isHazardous=${analysisResult.isHazardous}, classificationCode=${analysisResult.classificationCode}`);
                
                await this.serviceOrderRepository.updateMaterial(
                  material.id,
                  analysisResult.aiClassification,
                  analysisResult.isHazardous,
                  analysisResult.classificationCode,
                  analysisResult.riskLevel
                );
              }
            } catch (materialError) {
              console.error(`❌ Error analyzing material ${material.id}:`, materialError);
            }
          }

          successCount++;
          console.log(`✅ Processed service order ${i + 1}/${serviceOrders.length} (ID: ${savedServiceOrder.id})`);
          
        } catch (serviceOrderError) {
          failedCount++;
          const errorMsg = `Service order ${i + 1}: ${serviceOrderError.message}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }

        //update progress every 10 items or on last item
        if ((i + 1) % 10 === 0 || i === serviceOrders.length - 1) {
          await this.batchRequestRepository.updateProgress(requestId, {
            processed_count: i + 1,
            successful_count: successCount,
            failed_count: failedCount
          });
        }
      }

      const processingTime = Date.now() - startTime;
      await this.batchRequestRepository.updateStatus(requestId, 'COMPLETED', {
        completed_at: new Date(),
        successful_count: successCount,
        failed_count: failedCount,
        error_message: errors.length > 0 ? errors.join('; ') : null
      });

      console.log(`Batch ${requestId} completed: ${successCount} success, ${failedCount} failed (${processingTime}ms)`);
      
      //acknowledge message
      this.channel.ack(msg);
      
    } catch (error) {
      console.error('❌ Error processing batch message:', error);
      
      //if batch fails, mark as failed
      if (batchData?.requestId) {
        try {
          await this.batchRequestRepository.updateStatus(batchData.requestId, 'FAILED', {
            completed_at: new Date(),
            error_message: error.message
          });
        } catch (updateError) {
          console.error('❌ Error updating batch status to FAILED:', updateError);
        }
      }
      
      // reject message and don't requeue to avoid infinite loops
      this.channel.nack(msg, false, false);
    }
  }

  async stop() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('BatchProcessingConsumer stopped');
    } catch (error) {
      console.error('Error stopping BatchProcessingConsumer:', error);
    }
  }
}
