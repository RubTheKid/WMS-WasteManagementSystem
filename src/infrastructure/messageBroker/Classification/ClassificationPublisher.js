import amqp from 'amqplib';

export class ClassificationPublisher {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queueName = 'classification_queue';
        this.exchangeName = 'classification_exchange';
        this.routingKey = 'classification.task';
    }

    async connect() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || `amqp://${process.env.RABBITMQ_USER || 'admin'}:${process.env.RABBITMQ_PASSWORD || 'admin'}@wms-rabbitmq:5672`;
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();

            // Create exchange and queue
            await this.channel.assertExchange(this.exchangeName, 'direct', { durable: true });
            await this.channel.assertQueue(this.queueName, {
                durable: true,
                arguments: {
                    'x-max-priority': 10, // Priority queue
                    'x-message-ttl': 300000 // 5 minutes TTL
                }
            });
            await this.channel.bindQueue(this.queueName, this.exchangeName, this.routingKey);

            console.log('✅ Classification publisher connected to RabbitMQ');
        } catch (error) {
            console.error('❌ Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async publishClassificationTask(task) {
        try {
            if (!this.channel) {
                await this.connect();
            }

            const message = {
                id: task.id,
                type: 'classification',
                data: {
                    serviceOrderId: task.serviceOrderId,
                    booking: task.booking,
                    priority: task.priority || 5,
                    retryCount: task.retryCount || 0,
                    maxRetries: task.maxRetries || 3
                },
                timestamp: new Date().toISOString(),
                correlationId: task.correlationId || `classification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            const messageBuffer = Buffer.from(JSON.stringify(message));

            await this.channel.publish(
                this.exchangeName,
                this.routingKey,
                messageBuffer,
                {
                    persistent: true,
                    priority: message.data.priority,
                    correlationId: message.correlationId,
                    replyTo: 'classification_results',
                    timestamp: Date.now()
                }
            );

            console.log(`📤 Published classification task for service order ${task.serviceOrderId}`);
            return message.correlationId;
        } catch (error) {
            console.error('❌ Failed to publish classification task:', error);
            throw error;
        }
    }

    async publishBatchClassificationTasks(tasks) {
        try {
            if (!this.channel) {
                await this.connect();
            }

            const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const publishedTasks = [];

            for (const task of tasks) {
                const message = {
                    id: task.id,
                    type: 'classification',
                    batchId: batchId,
                    data: {
                        serviceOrderId: task.serviceOrderId,
                        booking: task.booking,
                        priority: task.priority || 5,
                        retryCount: task.retryCount || 0,
                        maxRetries: task.maxRetries || 3
                    },
                    timestamp: new Date().toISOString(),
                    correlationId: task.correlationId || `classification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                };

                const messageBuffer = Buffer.from(JSON.stringify(message));

                await this.channel.publish(
                    this.exchangeName,
                    this.routingKey,
                    messageBuffer,
                    {
                        persistent: true,
                        priority: message.data.priority,
                        correlationId: message.correlationId,
                        replyTo: 'classification_results',
                        timestamp: Date.now()
                    }
                );

                publishedTasks.push(message.correlationId);
            }

            console.log(`📤 Published batch of ${tasks.length} classification tasks (batch ID: ${batchId})`);
            return { batchId, publishedTasks };
        } catch (error) {
            console.error('❌ Failed to publish batch classification tasks:', error);
            throw error;
        }
    }

    async publishBackfillTask(backfillConfig) {
        try {
            if (!this.channel) {
                await this.connect();
            }

            const message = {
                id: `backfill_${Date.now()}`,
                type: 'backfill',
                data: {
                    limit: backfillConfig.limit || 100000,
                    batchSize: backfillConfig.batchSize || 50,
                    delay: backfillConfig.delay || 10,
                    priority: backfillConfig.priority || 3
                },
                timestamp: new Date().toISOString(),
                correlationId: `backfill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            const messageBuffer = Buffer.from(JSON.stringify(message));

            await this.channel.publish(
                this.exchangeName,
                'backfill.task',
                messageBuffer,
                {
                    persistent: true,
                    priority: message.data.priority,
                    correlationId: message.correlationId,
                    replyTo: 'backfill_results',
                    timestamp: Date.now()
                }
            );

            console.log(`📤 Published backfill task (limit: ${backfillConfig.limit})`);
            return message.correlationId;
        } catch (error) {
            console.error('❌ Failed to publish backfill task:', error);
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
            console.log('✅ Classification publisher disconnected from RabbitMQ');
        } catch (error) {
            console.error('❌ Error closing RabbitMQ connection:', error);
        }
    }
}
