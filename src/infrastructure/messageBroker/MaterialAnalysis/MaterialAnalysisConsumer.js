import amqp from 'amqplib';

export class MaterialAnalysisConsumer {
  constructor(materialAnalysisService, serviceOrderRepository) {
    this.materialAnalysisService = materialAnalysisService;
    this.serviceOrderRepository = serviceOrderRepository;
    this.connection = null;
    this.channel = null;
    this.queue = 'material-analysis';
  }

  async start() {
    try {
      this.connection = await amqp.connect({
        hostname: process.env.RABBITMQ_HOST,
        username: process.env.RABBITMQ_USER,
        password: process.env.RABBITMQ_PASSWORD
      });
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queue, { durable: true });

      // Process messages one at a time
      this.channel.prefetch(1);

      console.log('Material Analysis Consumer started');

      this.channel.consume(this.queue, async (msg) => {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log('Processing material analysis message:', message);

          const analysisResult = await this.processMessage(message);

          // Update the material directly in the database
          await this.serviceOrderRepository.updateMaterial(
            message.materialId,
            analysisResult.aiClassification,
            analysisResult.isHazardous,
            analysisResult.classificationCode,
            analysisResult.riskLevel
          );

          console.log(`Material ${message.materialId} analysis completed and saved`);

          // Acknowledge the message
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject the message and requeue it
          this.channel.nack(msg, false, true);
        }
      });
    } catch (error) {
      console.error('Failed to start consumer:', error);
      throw error;
    }
  }

  async processMessage(message) {
    try {
      const material = {
        id: message.materialId,
        description: message.description,
        product: message.product
      };

      const analysisResult = await this.materialAnalysisService.analyzeMaterial(material);
      return analysisResult;
    } catch (error) {
      console.error('Error processing material:', error);
      throw error;
    }
  }

  async stop() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}