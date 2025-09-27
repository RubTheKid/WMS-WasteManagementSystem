import amqp from 'amqplib';

export class MaterialAnalysisPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queue = 'material-analysis';
    this.setupConnection();
  }

  async setupConnection() {
    try {
      this.connection = await amqp.connect({
        hostname: process.env.RABBITMQ_HOST,
        username: process.env.RABBITMQ_USER,
        password: process.env.RABBITMQ_PASSWORD
      });
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queue, { durable: true });
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async publishMaterials(serviceOrderId, materials) {
    try {
      for (const material of materials) {
        const message = {
          serviceOrderId,
          materialId: material.id,
          description: material.description,
          product: material.product
        };

        await this.channel.sendToQueue(
          this.queue,
          Buffer.from(JSON.stringify(message)),
          { persistent: true }
        );
      }
    } catch (error) {
      console.error('Failed to publish materials:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}