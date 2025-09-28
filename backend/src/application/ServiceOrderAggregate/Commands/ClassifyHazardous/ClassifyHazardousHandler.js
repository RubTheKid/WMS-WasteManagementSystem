import { ClassifyHazardousResponse } from './ClassifyHazardousResponse.js';

export class ClassifyHazardousHandler {
  constructor(serviceOrderRepository, mlAnalysisService, materialAnalysisService) {
    this.serviceOrderRepository = serviceOrderRepository;
    this.mlAnalysisService = mlAnalysisService;
    this.materialAnalysisService = materialAnalysisService;
  }

  async handle(command) {
    try {
      const serviceOrder = await this.serviceOrderRepository.findById(command.serviceOrderId);
      
      if (!serviceOrder) {
        throw new Error('Service order not found');
      }

      //classify the SO with ML model. If the ML model has high confidence, use the ML result. Otherwise, use the AI model.
      console.log(`Starting ML classification for service order ${command.serviceOrderId}`);
      const mlClassificationResult = this.mlAnalysisService.classifyServiceOrder(serviceOrder);
      
      const materialResults = [];
      let totalCost = 0;
      let aiUsageCount = 0;
      let mlUsageCount = 0;

      for (const material of serviceOrder.materials) {
        const result = await this.materialAnalysisService.analyzeMaterial(material);
        materialResults.push(result);
        
        totalCost += result.cost || 0;
        if (result.source.includes('Gemini AI')) {
          aiUsageCount++;
        } else if (result.source.includes('ML')) {
          mlUsageCount++;
        }
      }

      // combine results and create response
      const analysisMetrics = {
        totalMaterials: serviceOrder.materials.length,
        mlAnalyzed: mlUsageCount,
        aiAnalyzed: aiUsageCount,
        totalCost: totalCost,
        costSavings: `${Math.round((mlUsageCount / serviceOrder.materials.length) * 100)}% cost reduction`,
        averageConfidence: materialResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / materialResults.length
      };

      return new ClassifyHazardousResponse(
        command.serviceOrderId,
        {
          ...mlClassificationResult.toJSON(),
          materialAnalysis: materialResults,
          analysisFlow: 'ML-First with AI Fallback'
        },
        analysisMetrics,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error in ClassifyHazardousHandler:', error);
      throw error;
    }
  }
}
