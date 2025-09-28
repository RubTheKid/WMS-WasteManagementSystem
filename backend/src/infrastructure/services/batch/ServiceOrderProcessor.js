import { ServiceOrder, ServiceOrderStatus } from '../../../domain/ServiceOrderAggregate/ServiceOrder.js';
import { Material } from '../../../domain/ServiceOrderAggregate/Material.js';

export class ServiceOrderProcessor {
  constructor(serviceOrderRepository, materialAnalysisService) {
    this.serviceOrderRepository = serviceOrderRepository;
    this.materialAnalysisService = materialAnalysisService;
  }

  async processServiceOrder(serviceOrderData, rateLimitManager, metricsCollector) {
    try {
      // create domain objects
      const serviceOrder = this.createServiceOrderFromData(serviceOrderData);
      
      // save service order
      const savedServiceOrder = await this.serviceOrderRepository.save(serviceOrder);
      
      // process materials
      const materialResults = await this.processMaterials(
        savedServiceOrder.materials, 
        rateLimitManager, 
        metricsCollector
      );
      
      metricsCollector.incrementSuccess();
      
      return {
        serviceOrderId: savedServiceOrder.id,
        status: 'SUCCESS',
        materialsAnalyzed: materialResults.length,
        materials: materialResults
      };
      
    } catch (error) {
      console.error(`Error processing service order:`, error);
      metricsCollector.incrementError();
      
      return {
        serviceOrder: serviceOrderData,
        status: 'ERROR',
        error: error.message
      };
    }
  }

  createServiceOrderFromData(serviceOrderData) {
    const appointmentDate = new Date(serviceOrderData.appointmentDate);
    
    const materials = serviceOrderData.materials.map(m => new Material(
      null,
      m.description,
      m.product
    ));

    return new ServiceOrder(
      null,
      serviceOrderData.customerName,
      serviceOrderData.companyName,
      appointmentDate,
      ServiceOrderStatus.SCHEDULED,
      new Date(),
      new Date(),
      materials
    );
  }

  async processMaterials(materials, rateLimitManager, metricsCollector) {
    const materialResults = [];
    
    for (const material of materials) {
      try {
        //rate limiting for AI calls
        await rateLimitManager.rateLimitApiCall();
        
        const analysisResult = await this.materialAnalysisService.analyzeMaterial(material);
        materialResults.push(analysisResult);
        
        // Track costs and usage
        metricsCollector.addCost(analysisResult.cost);
        
        if (analysisResult.source && analysisResult.source.includes('Gemini AI')) {
          metricsCollector.incrementAiAnalyzed();
        } else if (analysisResult.source && analysisResult.source.includes('ML')) {
          metricsCollector.incrementMlAnalyzed();
        }

        // update material
        if (analysisResult.materialId) {
          await this.serviceOrderRepository.updateMaterial(
            analysisResult.materialId,
            analysisResult.aiClassification,
            analysisResult.isHazardous,
            analysisResult.classificationCode,
            analysisResult.riskLevel
          );
        }
        
      } catch (materialError) {
        console.error(`Error analyzing material ${material.id}:`, materialError);
        // continue processing other materials
        materialResults.push({
          materialId: material.id,
          status: 'ERROR',
          error: materialError.message
        });
      }
    }
    
    return materialResults;
  }

  async processBatch(serviceOrdersBatch, rateLimitManager, metricsCollector) {
    const batchResults = [];
    
    for (const serviceOrderData of serviceOrdersBatch) {
      const result = await this.processServiceOrder(serviceOrderData, rateLimitManager, metricsCollector);
      batchResults.push(result);
      metricsCollector.addResult(result);
    }
    
    return batchResults;
  }
}
