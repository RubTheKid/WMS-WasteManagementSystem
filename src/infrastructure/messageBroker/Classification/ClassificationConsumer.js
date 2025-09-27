import amqp from 'amqplib';
import { ServiceOrderRepository } from '../../repositories/ServiceOrderRepository.js';
import { MaterialRepository } from '../../repositories/MaterialRepository.js';

export class ClassificationConsumer {
    constructor(classificationService = null) {
        this.connection = null;
        this.channel = null;
        this.serviceOrderRepository = new ServiceOrderRepository();
        this.materialRepository = new MaterialRepository();
        this.classificationService = classificationService;
        this.queueName = 'classification_queue';
        this.exchangeName = 'classification_exchange';
        this.resultsQueueName = 'classification_results';
        this.isProcessing = false;
    }

    async connect() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@wms-rabbitmq:5672';
            console.log('Connecting to RabbitMQ...');
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();

            await this.channel.prefetch(10);

            await this.channel.assertExchange(this.exchangeName, 'direct', { durable: true });
            await this.channel.assertQueue(this.queueName, {
                durable: true,
                arguments: {
                    'x-max-priority': 10,
                    'x-message-ttl': 300000
                }
            });
            await this.channel.assertQueue(this.resultsQueueName, { durable: true });

            await this.channel.bindQueue(this.queueName, this.exchangeName, 'classification.task');
            await this.channel.bindQueue(this.queueName, this.exchangeName, 'backfill.task');

            console.log('✅ Classification consumer connected to RabbitMQ');
        } catch (error) {
            console.error('❌ Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async startConsuming() {
        try {
            if (!this.channel) {
                await this.connect();
            }

            console.log('🔄 Starting classification consumer...');

            await this.channel.consume(this.queueName, async (message) => {
                if (message) {
                    try {
                        const task = JSON.parse(message.content.toString());
                        console.log(`📥 Received classification task: ${task.type} (ID: ${task.id})`);

                        if (task.type === 'classification') {
                            await this.processClassificationTask(task);
                        } else if (task.type === 'backfill') {
                            await this.processBackfillTask(task);
                        }

                        // Acknowledge the message
                        this.channel.ack(message);
                    } catch (error) {
                        console.error('❌ Error processing message:', error);

                        // Check if we should retry
                        const task = JSON.parse(message.content.toString());
                        if (task.data.retryCount < task.data.maxRetries) {
                            // Reject and requeue for retry
                            this.channel.nack(message, false, true);
                            console.log(`🔄 Retrying task ${task.id} (attempt ${task.data.retryCount + 1})`);
                        } else {
                            // Max retries reached, send to dead letter queue
                            this.channel.nack(message, false, false);
                            console.log(`💀 Task ${task.id} sent to dead letter queue after ${task.data.maxRetries} retries`);
                        }
                    }
                }
            });

            console.log('✅ Classification consumer started and listening for messages');
        } catch (error) {
            console.error('❌ Failed to start classification consumer:', error);
            throw error;
        }
    }

    async processClassificationTask(task) {
        try {
            console.log(`🔍 Processing classification for service order ${task.data.serviceOrderId}`);

            // Get materials for this service order
            const materials = await this.materialRepository.getByServiceOrderId(task.data.serviceOrderId);

            // Create booking object for classification
            const booking = {
                description: task.data.booking.description || '',
                product: task.data.booking.product || 'OTHER',
                internalNotes: task.data.booking.internalNotes || '',
                customerName: task.data.booking.customerName,
                companyName: task.data.booking.companyName,
                materials: materials.map(m => ({
                    description: m.description,
                    product: m.product,
                    internalNotes: m.internalNotes
                }))
            };

            // Classify the booking
            const classification = this.classificationService.classifyBooking(booking);

            // Update service order with classification
            await this.serviceOrderRepository.updateClassification(
                task.data.serviceOrderId,
                classification.classification,
                classification.confidence,
                true // is_backfilled
            );

            // Update materials with classification
            for (const material of materials) {
                const materialBooking = {
                    description: material.description,
                    product: material.product,
                    internalNotes: material.internalNotes
                };

                const materialClassification = this.classificationService.classifyBooking(materialBooking);

                await this.materialRepository.updateClassification(
                    material.id,
                    materialClassification.classification,
                    materialClassification.confidence
                );
            }

            // Publish result
            await this.publishResult({
                taskId: task.id,
                correlationId: task.correlationId,
                serviceOrderId: task.data.serviceOrderId,
                classification: classification.classification,
                confidence: classification.confidence,
                status: 'completed',
                timestamp: new Date().toISOString()
            });

            console.log(`✅ Classification completed for service order ${task.data.serviceOrderId}: ${classification.classification}`);
        } catch (error) {
            console.error(`❌ Error processing classification task ${task.id}:`, error);

            // Publish error result
            await this.publishResult({
                taskId: task.id,
                correlationId: task.correlationId,
                serviceOrderId: task.data.serviceOrderId,
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });

            throw error;
        }
    }

    async processBackfillTask(task) {
        try {
            console.log(`🔄 Processing backfill task (limit: ${task.data.limit})`);

            const { limit, batchSize, delay } = task.data;
            let processedCount = 0;
            let successCount = 0;
            let errorCount = 0;

            // Get unclassified service orders
            const unclassifiedOrders = await this.serviceOrderRepository.getUnclassifiedOrders(limit);
            const totalRecords = unclassifiedOrders.length;

            console.log(`📊 Found ${totalRecords} unclassified service orders for backfill`);

            // Process in batches
            for (let i = 0; i < unclassifiedOrders.length; i += batchSize) {
                const batch = unclassifiedOrders.slice(i, i + batchSize);

                // Process batch
                const batchResults = await this.processBatch(batch);
                successCount += batchResults.success;
                errorCount += batchResults.errors;
                processedCount += batch.length;

                // Publish progress update
                await this.publishResult({
                    taskId: task.id,
                    correlationId: task.correlationId,
                    type: 'backfill_progress',
                    progress: {
                        processed: processedCount,
                        total: totalRecords,
                        success: successCount,
                        errors: errorCount,
                        percentage: ((processedCount / totalRecords) * 100).toFixed(2)
                    },
                    timestamp: new Date().toISOString()
                });

                // Rate limiting delay
                if (i + batchSize < unclassifiedOrders.length) {
                    await this.delay(delay);
                }
            }

            // Publish final result
            await this.publishResult({
                taskId: task.id,
                correlationId: task.correlationId,
                type: 'backfill_completed',
                result: {
                    totalProcessed: processedCount,
                    successCount,
                    errorCount,
                    successRate: ((successCount / processedCount) * 100).toFixed(2)
                },
                timestamp: new Date().toISOString()
            });

            console.log(`✅ Backfill completed: ${successCount} successful, ${errorCount} errors`);
        } catch (error) {
            console.error(`❌ Error processing backfill task ${task.id}:`, error);

            await this.publishResult({
                taskId: task.id,
                correlationId: task.correlationId,
                type: 'backfill_failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });

            throw error;
        }
    }

    async processBatch(serviceOrders) {
        let success = 0;
        let errors = 0;

        for (const serviceOrder of serviceOrders) {
            try {
                // Get materials for this service order
                const materials = await this.materialRepository.getByServiceOrderId(serviceOrder.id);

                // Create booking object for classification
                const booking = {
                    description: serviceOrder.description || '',
                    product: serviceOrder.product || 'OTHER',
                    internalNotes: serviceOrder.internalNotes || '',
                    customerName: serviceOrder.customerName,
                    companyName: serviceOrder.companyName,
                    materials: materials.map(m => ({
                        description: m.description,
                        product: m.product,
                        internalNotes: m.internalNotes
                    }))
                };

                // Classify the booking
                const classification = this.classificationService.classifyBooking(booking);

                // Update service order with classification
                await this.serviceOrderRepository.updateClassification(
                    serviceOrder.id,
                    classification.classification,
                    classification.confidence,
                    true // is_backfilled
                );

                // Update materials with classification
                for (const material of materials) {
                    const materialBooking = {
                        description: material.description,
                        product: material.product,
                        internalNotes: material.internalNotes
                    };

                    const materialClassification = this.classificationService.classifyBooking(materialBooking);

                    await this.materialRepository.updateClassification(
                        material.id,
                        materialClassification.classification,
                        materialClassification.confidence
                    );
                }

                success++;
            } catch (error) {
                console.error(`Error processing service order ${serviceOrder.id}:`, error);
                errors++;
            }
        }

        return { success, errors };
    }

    async publishResult(result) {
        try {
            if (!this.channel) {
                await this.connect();
            }

            const messageBuffer = Buffer.from(JSON.stringify(result));

            await this.channel.publish(
                this.exchangeName,
                'classification.result',
                messageBuffer,
                {
                    persistent: true,
                    correlationId: result.correlationId,
                    timestamp: Date.now()
                }
            );

            console.log(`📤 Published result for task ${result.taskId}`);
        } catch (error) {
            console.error('❌ Failed to publish result:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('✅ Classification consumer disconnected from RabbitMQ');
        } catch (error) {
            console.error('❌ Error closing RabbitMQ connection:', error);
        }
    }
}
