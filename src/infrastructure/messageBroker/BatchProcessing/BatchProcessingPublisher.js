import amqp from 'amqplib';

export class BatchProcessingPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queue = 'batch-processing';
    this.exchange = 'batch-processing-exchange';
  }

  async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@wms-rabbitmq:5672';
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declare exchange and queue
      await this.channel.assertExchange(this.exchange, 'direct', { durable: true });
      await this.channel.assertQueue(this.queue, { durable: true });
      await this.channel.bindQueue(this.queue, this.exchange, 'batch.process');
      
      console.log('BatchProcessingPublisher connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect BatchProcessingPublisher to RabbitMQ:', error);
      throw error;
    }
  }

  async publishBatch(requestId, serviceOrders) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const message = {
        requestId,
        serviceOrders,
        timestamp: new Date().toISOString(),
        totalCount: serviceOrders.length
      };

      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const published = this.channel.publish(
        this.exchange,
        'batch.process',
        messageBuffer,
        {
          persistent: true,
          messageId: requestId,
          timestamp: Date.now(),
          headers: {
            'x-request-id': requestId,
            'x-total-count': serviceOrders.length
          }
        }
      );

      if (published) {
        console.log(`Published batch ${requestId} with ${serviceOrders.length} service orders to RabbitMQ`);
        return true;
      } else {
        throw new Error('Failed to publish message to RabbitMQ');
      }
    } catch (error) {
      console.error(`Error publishing batch ${requestId}:`, error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('BatchProcessingPublisher connection closed');
    } catch (error) {
      console.error('Error closing BatchProcessingPublisher connection:', error);
    }
  }

  isConnected() {
    return this.connection && !this.connection.connection.stream.destroyed;
  }
}
