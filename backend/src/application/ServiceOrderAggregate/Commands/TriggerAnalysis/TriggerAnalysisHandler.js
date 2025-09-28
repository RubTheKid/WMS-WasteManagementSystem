import { TriggerAnalysisResponse } from './TriggerAnalysisResponse.js';

export class TriggerAnalysisHandler {
  constructor(materialAnalysisScheduler) {
    this.materialAnalysisScheduler = materialAnalysisScheduler;
  }

  async handle(command) {
    try {
      await this.materialAnalysisScheduler.triggerProcessing();
      
      return new TriggerAnalysisResponse(
        'Material analysis process triggered successfully',
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error in TriggerAnalysisHandler:', error);
      throw error;
    }
  }
}