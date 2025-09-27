import OpenAI from 'openai';
import { RiskLevel } from '../../domain/ServiceOrderAggregate/WasteItem.js';

const HazardType = {
  HEALTH_HAZARD: 'HEALTH_HAZARD',
  CHEMICAL_HAZARD: 'CHEMICAL_HAZARD',
  BIOLOGICAL_HAZARD: 'BIOLOGICAL_HAZARD',
  FIRE_HAZARD: 'FIRE_HAZARD',
  ENVIRONMENTAL_HAZARD: 'ENVIRONMENTAL_HAZARD',
  PHYSICAL_HAZARD: 'PHYSICAL_HAZARD',
  RADIOACTIVE_HAZARD: 'RADIOACTIVE_HAZARD',
  ELECTRICAL_HAZARD: 'ELECTRICAL_HAZARD',
};

class OpenAIService { 
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async analyzeWasteItemRisk(itemName, description) {
    try {
      const prompt = this.buildRiskAnalysisPrompt(itemName, description);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = this.parseAndValidateResponse(content, itemName);

      return result;
    } catch (error) {
      console.error('Error in analyzeWasteItemRisk:', error);
      return this.getFallbackResult();
    }
  }

  buildRiskAnalysisPrompt(itemName, description) {
    return `
You are a waste management and hazardous materials classification expert. Analyze the risk of handling and disposal for the following waste item:

ITEM: ${itemName}
DESCRIPTION: ${description || 'Not provided'}

CLASSIFICATION CRITERIA:

RISK LEVELS:
- LOW: Minimal risk (common waste, paper, uncontaminated plastic, organic waste)
- MEDIUM: Moderate risk (glass, metals, basic electronics, construction debris)
- HIGH: Significant risk (chemicals, batteries, fluorescent lamps, medical waste)
- CRITICAL: Extreme risk (radioactive materials, highly toxic substances, explosives)

HAZARD TYPES (select all that apply):
- HEALTH_HAZARD: Can cause health issues through exposure
- CHEMICAL_HAZARD: Involves toxic, corrosive, or reactive chemicals
- BIOLOGICAL_HAZARD: Contains pathogens or biological contaminants
- FIRE_HAZARD: Flammable, combustible, or explosive materials
- ENVIRONMENTAL_HAZARD: Can cause environmental damage
- PHYSICAL_HAZARD: Sharp objects, heavy materials, physical dangers
- RADIOACTIVE_HAZARD: Contains radioactive materials
- ELECTRICAL_HAZARD: Electrical equipment with potential shock risk

CONFIDENCE LEVEL: Estimate how confident you are in this classification (0.1 to 1.0)

Respond ONLY in the following JSON format:
{
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "analysis": "Detailed risk explanation in English including handling precautions",
  "hazardTypes": ["HAZARD_TYPE1", "HAZARD_TYPE2", ...],
  "confidence": 0.85
}

Examples:
- "office paper" → LOW risk, minimal hazards
- "used lithium batteries" → HIGH risk, chemical/fire hazards
- "medical sharps" → CRITICAL risk, biological/health hazards
`;
  }

  parseAndValidateResponse(content, itemName) {
    try {
      const result = JSON.parse(content);

      if (!result.riskLevel || !result.analysis || !result.hazardTypes || !result.confidence) {
        throw new Error('Missing required fields in OpenAI response');
      }

      const validRiskLevels = [
        RiskLevel.LOW,
        RiskLevel.MEDIUM,
        RiskLevel.HIGH,
        RiskLevel.CRITICAL,
      ];

      if (!validRiskLevels.includes(result.riskLevel)) {
        result.riskLevel = RiskLevel.MEDIUM;
      }

      const validHazardTypes = Object.values(HazardType);
      result.hazardTypes = result.hazardTypes.filter((type) => validHazardTypes.includes(type));

      result.confidence = Math.max(0.1, Math.min(1.0, parseFloat(result.confidence) || 0.5));

      return {
        riskLevel: result.riskLevel,
        analysis: result.analysis,
        hazardTypes: result.hazardTypes,
        confidence: result.confidence,
      };
    } catch (error) {
      throw new Error('Invalid response format from OpenAI');
    }
  }

  getFallbackResult() {
    return {
      riskLevel: RiskLevel.MEDIUM,
      analysis: 'Automatic analysis failed - requires manual review. Please consult a waste management specialist.',
      hazardTypes: [],
      confidence: 0.1,
    };
  }

  async analyzeMultipleWasteItems(items) {
    const results = new Map();

    for (const item of items) {
      try {
        const result = await this.analyzeWasteItemRisk(item.name, item.description);
        results.set(item.name, result);

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        results.set(item.name, this.getFallbackResult());
      }
    }

    return results;
  }
}

export { OpenAIService, HazardType };

