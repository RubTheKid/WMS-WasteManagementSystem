export class MaterialAnalysisScheduler {
    constructor(serviceOrderRepository, materialAnalysisPublisher) {
        this.serviceOrderRepository = serviceOrderRepository;
        this.materialAnalysisPublisher = materialAnalysisPublisher;
        this.intervalId = null;
        this.isProcessing = false;
    }

    start(intervalMs = 30000) { // Default: check every 30 seconds
        console.log('Material Analysis Scheduler started');

        // Run immediately
        this.processUnanalyzedMaterials();

        // Then run on interval
        this.intervalId = setInterval(() => {
            this.processUnanalyzedMaterials();
        }, intervalMs);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Material Analysis Scheduler stopped');
        }
    }

    async processUnanalyzedMaterials() {
        if (this.isProcessing) {
            console.log('Already processing materials, skipping this cycle');
            return;
        }

        this.isProcessing = true;

        try {
            console.log('Checking for unanalyzed materials...');

            // Get all service orders to check for unanalyzed materials
            const serviceOrders = await this.serviceOrderRepository.findAll();

            let materialsToProcess = [];

            for (const serviceOrder of serviceOrders) {
                // Find materials that haven't been analyzed yet
                const unanalyzedMaterials = serviceOrder.materials.filter(
                    material => !material.aiClassification || material.aiClassification === null
                );

                if (unanalyzedMaterials.length > 0) {
                    console.log(`Found ${unanalyzedMaterials.length} unanalyzed materials in service order ${serviceOrder.id}`);

                    // Queue each material for analysis
                    for (const material of unanalyzedMaterials) {
                        materialsToProcess.push({
                            serviceOrderId: serviceOrder.id,
                            material: material
                        });
                    }
                }
            }

            if (materialsToProcess.length > 0) {
                console.log(`Queueing ${materialsToProcess.length} materials for analysis`);

                // Publish materials to RabbitMQ
                for (const item of materialsToProcess) {
                    await this.materialAnalysisPublisher.publishMaterials(
                        item.serviceOrderId,
                        [item.material]
                    );
                }

                console.log(`Successfully queued ${materialsToProcess.length} materials for analysis`);
            } else {
                console.log('No unanalyzed materials found');
            }

        } catch (error) {
            console.error('Error processing unanalyzed materials:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    // Method to manually trigger processing
    async triggerProcessing() {
        await this.processUnanalyzedMaterials();
    }
}
