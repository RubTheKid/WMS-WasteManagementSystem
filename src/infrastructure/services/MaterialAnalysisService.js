import { GoogleGenerativeAI } from '@google/generative-ai';
import { HazardousClassificationService } from './HazardousClassificationService.js';

export class MaterialAnalysisService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    this.fallbackService = new HazardousClassificationService();
  }

  async analyzeMaterials(materials) {
    const results = [];


    for (let i = 0; i < materials.length; i += 5) {
      const batch = materials.slice(i, i + 5);
      const batchPromises = batch.map(material => this.analyzeMaterial(material));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  async analyzeMaterial(material) {
    try {
      // Try Gemini AI first
      const prompt = `You are an EPA RCRA hazardous waste classification expert. Analyze this waste material according to EPA RCRA standards:

      Product Type: ${material.product}
      Description: ${material.description}

      Classify this material according to EPA RCRA hazardous waste categories:

      CHARACTERISTIC WASTES:
      - Ignitable (D001): Wastes that can easily catch fire (flash point <140°F, oxidizers, ignitable compressed gas, ignitable solids)
      - Corrosive (D002): Wastes that can corrode containers or cause skin/eye damage (pH ≤2 or ≥12.5, corrodes steel >6.35mm/year)
      - Reactive (D003): Wastes that are unstable, explosive, or release toxic fumes (unstable, reacts violently with water, generates toxic gases, explosive)
      - Toxic (D004-D043): Wastes containing specific toxins above regulatory levels

      LISTED WASTES (if applicable):
      - F-listed: From non-specific sources (solvents, electroplating, etc.)
      - K-listed: From specific industries (petroleum, iron/steel, etc.)
      - P-listed: Acute hazardous wastes (highly toxic)
      - U-listed: Toxic wastes

      Respond ONLY with a JSON object in this exact format:
      {
        "isHazardous": true/false,
        "classification": "D001" or "D002" or "D003" or "D004-D043" or "F001" or "K001" or "P001" or "U001" or "NON-HAZARDOUS",
        "category": "Ignitable" or "Corrosive" or "Reactive" or "Toxic" or "Listed Waste" or "Non-Hazardous",
        "riskLevel": "LOW" or "MODERATE" or "HIGH" or "EXTREME"
      }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      let classificationData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          classificationData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', content);

        const isHazardous = content.toLowerCase().includes('true') ||
          content.toLowerCase().includes('hazardous') ||
          content.toLowerCase().includes('d001') ||
          content.toLowerCase().includes('d002') ||
          content.toLowerCase().includes('d003');

        classificationData = {
          isHazardous,
          classification: isHazardous ? 'UNKNOWN' : 'NON-HAZARDOUS',
          category: isHazardous ? 'Unknown' : 'Non-Hazardous',
          riskLevel: isHazardous ? 'MODERATE' : 'LOW'
        };
      }

      return {
        materialId: material.id,
        isHazardous: classificationData.isHazardous,
        aiClassification: `${classificationData.category} (${classificationData.classification})`,
        classificationCode: classificationData.classification,
        riskLevel: classificationData.riskLevel,
        source: 'Gemini AI'
      };
    } catch (error) {
      console.error(`Gemini AI failed for material ${material.id}, using fallback ML algorithm:`, error.message);
      
      // Fallback to rule-based ML algorithm
      try {
        const fallbackScore = this.fallbackService.analyzeMaterial(material);
        const isHazardous = fallbackScore >= this.fallbackService.thresholds.hazardous;
        
        return {
          materialId: material.id,
          isHazardous: isHazardous,
          aiClassification: isHazardous ? 'Hazardous (Rule-based ML)' : 'Non-Hazardous (Rule-based ML)',
          classificationCode: isHazardous ? 'HAZARDOUS' : 'NON-HAZARDOUS',
          riskLevel: isHazardous ? 'HIGH' : 'LOW',
          source: 'Rule-based ML (Fallback)',
          confidence: Math.min(0.95, Math.max(0.7, fallbackScore / 100))
        };
      } catch (fallbackError) {
        console.error(`Fallback classification also failed for material ${material.id}:`, fallbackError);
        
        // Ultimate fallback - basic classification
        return {
          materialId: material.id,
          isHazardous: false,
          aiClassification: 'Non-Hazardous (Default)',
          classificationCode: 'NON-HAZARDOUS',
          riskLevel: 'LOW',
          source: 'Default Classification',
          confidence: 0.1
        };
      }
    }
  }
}