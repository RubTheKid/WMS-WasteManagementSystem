import { GoogleGenerativeAI } from '@google/generative-ai';
import { MLAnalysisService } from './MLAnalysisService.js';
import { ClassificationTrainingData } from '../../domain/ClassificationAggregate/ClassificationTrainingData.js';

export class MaterialAnalysisService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    this.mlService = new MLAnalysisService();
    this.aiConfidenceThreshold = 0.75;
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
      // first: Try ML Analysis first (cost-free)
      console.log(`Starting ML analysis for material ${material.id}`);
      const mlResult = await this.mlService.analyzeMaterial(material);
      
      // check if ML has high confidence
      if (mlResult.hasHighConfidence) {
        console.log(`ML analysis has high confidence (${mlResult.confidence.toFixed(3)}) for material ${material.id}, using ML result`);
        const mlHighConfidenceResult = {
          materialId: material.id,
          isHazardous: mlResult.isHazardous,
          aiClassification: mlResult.aiClassification,
          classificationCode: mlResult.classificationCode,
          riskLevel: mlResult.riskLevel,
          source: 'ML Analysis (High Confidence)',
          confidence: mlResult.confidence,
          cost: 0
        };

        // apply consistency validation and correction
        return this.validateAndFixConsistency(mlHighConfidenceResult, material);
      }
      
      // IF  ML has low confidence, use Gemini AI for better accuracy
      console.log(`ML confidence (${mlResult.confidence.toFixed(3)}) below threshold (${this.aiConfidenceThreshold}), using Gemini AI for material ${material.id}`);
      
      const prompt = `You are an EPA RCRA hazardous waste classification expert. Analyze this waste material according to EPA RCRA standards:

      Product Type: ${material.product}
      Description: ${material.description}

      ML Pre-analysis suggests: ${mlResult.isHazardous ? 'Potentially Hazardous' : 'Likely Non-Hazardous'} (Confidence: ${mlResult.confidence.toFixed(3)})

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

      console.log(`🤖 Gemini response for material ${material.id}:`, content);

      let classificationData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          classificationData = JSON.parse(jsonMatch[0]);
          console.log(`📊 Parsed Gemini data for material ${material.id}:`, classificationData);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', content);
        console.error('Parse error:', parseError.message);

        const isHazardous = content.toLowerCase().includes('true') ||
          content.toLowerCase().includes('hazardous') ||
          content.toLowerCase().includes('d001') ||
          content.toLowerCase().includes('d002') ||
          content.toLowerCase().includes('d003');

        console.log(`Gemini fallback parsing: isHazardous=${isHazardous} for material ${material.id}`);

        classificationData = {
          isHazardous,
          classification: isHazardous ? 'HAZARDOUS' : 'NON-HAZARDOUS',
          category: isHazardous ? 'Hazardous' : 'Non-Hazardous',
          riskLevel: isHazardous ? 'MODERATE' : 'LOW'
        };
      }

      const geminiResult = {
        materialId: material.id,
        isHazardous: classificationData.isHazardous,
        aiClassification: `${classificationData.category} (${classificationData.classification})`,
        classificationCode: classificationData.classification,
        riskLevel: classificationData.riskLevel,
        source: 'Gemini AI (Low ML Confidence)',
        confidence: 0.9, // high confidence when using AI
        cost: 1, // if theres cost, indicates that AI was used.
        mlPreAnalysis: {
          confidence: mlResult.confidence,
          prediction: mlResult.isHazardous ? 'Hazardous' : 'Non-Hazardous'
        }
      };

      // apply consistency validation and correction
      return this.validateAndFixConsistency(geminiResult, material);
    } catch (error) {
      console.error(`Gemini AI failed for material ${material.id}, falling back to ML result:`, error.message);
      
      // fallback: Use ML result even with low confidence
      try {
        const mlResult = await this.mlService.analyzeMaterial(material);
        
        const fallbackResult = {
          materialId: material.id,
          isHazardous: mlResult.isHazardous,
          aiClassification: mlResult.aiClassification + ' (AI Failed)',
          classificationCode: mlResult.classificationCode,
          riskLevel: mlResult.riskLevel,
          source: 'ML Analysis (AI Fallback)',
          confidence: mlResult.confidence,
          cost: 0
        };

        // apply consistency validation and correction
        return this.validateAndFixConsistency(fallbackResult, material);
      } catch (fallbackError) {
        console.error(`ML fallback also failed for material ${material.id}:`, fallbackError);
        console.error('Material object:', JSON.stringify(material, null, 2));
        console.error('Fallback error details:', fallbackError);
        
        return {
          materialId: material.id,
          isHazardous: false,
          aiClassification: 'Non-Hazardous (Default)',
          classificationCode: 'NON-HAZARDOUS',
          riskLevel: 'LOW',
          source: 'Default Classification',
          confidence: 0.1,
          cost: 0
        };
      }
    }
  }

  // validates and fixes inconsistencies in classification results
  validateAndFixConsistency(result, material) {
    const originalResult = { ...result };
    let wasFixed = false;

    // inconsistency check: isHazardous=true but classification indicates non-hazardous
    const hasInconsistency = 
      (result.isHazardous && result.classificationCode === 'NON-HAZARDOUS') ||
      (!result.isHazardous && result.classificationCode !== 'NON-HAZARDOUS') ||
      (result.isHazardous && result.aiClassification.includes('Non-Hazardous')) ||
      (!result.isHazardous && result.aiClassification.includes('Hazardous'));

    if (hasInconsistency) {
      console.log(`🔧 Inconsistency detected for material ${material.id}, applying fixes...`);
      console.log(`   Original: isHazardous=${result.isHazardous}, classificationCode=${result.classificationCode}`);

      const text = `${material.description} ${material.product}`.toLowerCase();
      const containsHazardousKeywords = this.containsKnownHazardousKeywords(text);

      if (containsHazardousKeywords || result.isHazardous) {
        result.isHazardous = true;
        result.classificationCode = this.getHazardousClassificationCode(text);
        result.riskLevel = this.getHazardousRiskLevel(text);
        result.aiClassification = result.aiClassification
          .replace('Non-Hazardous', 'Hazardous')
          .replace('NON-HAZARDOUS', result.classificationCode);
        
        wasFixed = true;
      } else {
        result.isHazardous = false;
        result.classificationCode = 'NON-HAZARDOUS';
        result.riskLevel = 'LOW';
        result.aiClassification = result.aiClassification
          .replace('Hazardous', 'Non-Hazardous')
          .replace(/D00[1-9]|HAZARDOUS/g, 'NON-HAZARDOUS');
        
        wasFixed = true;
        console.log(`   Fixed to: isHazardous=${result.isHazardous}, classificationCode=${result.classificationCode}`);
      }

      // fix metadata
      result.consistencyFix = {
        wasFixed: true,
        originalClassification: originalResult.aiClassification,
        originalCode: originalResult.classificationCode,
        originalHazardous: originalResult.isHazardous,
        fixReason: containsHazardousKeywords ? 'Contains hazardous keywords' : 'Consistency correction'
      };
    }

    return result;
  }
  
  containsKnownHazardousKeywords(text) {
    const hazardousKeywords = ClassificationTrainingData.getHazardousKeywords();
    const nonHazardousKeywords = ClassificationTrainingData.getNonHazardousKeywords();
    
    // Check for non-hazardous indicators first (like "clean", "uncontaminated")
    const hasNonHazardousIndicators = nonHazardousKeywords.some(keyword => text.includes(keyword));
    
    // If it has strong non-hazardous indicators, be more selective about hazardous keywords
    if (hasNonHazardousIndicators) {
      // Only consider it hazardous if it has very specific hazardous keywords
      const strongHazardousKeywords = [
        'medical waste', 'biohazard', 'radioactive', 'toxic', 'explosive', 
        'corrosive', 'flammable', 'acid', 'mercury', 'lead', 'asbestos',
        'cesium', 'uranium', 'plutonium', 'pesticide', 'chemical waste'
      ];
      return strongHazardousKeywords.some(keyword => text.includes(keyword));
    }
    
    // Otherwise, use full hazardous keyword list
    return hazardousKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Get appropriate classification code for hazardous materials
   */
  getHazardousClassificationCode(text) {
    if (text.includes('medical') || text.includes('biohazard') || text.includes('infectious')) {
      return 'D003'; // Reactive waste (medical/biohazard)
    }
    if (text.includes('battery') || text.includes('acid') || text.includes('corrosive')) {
      return 'D002'; // Corrosive
    }
    if (text.includes('flammable') || text.includes('fuel') || text.includes('solvent')) {
      return 'D001'; // Ignitable
    }
    if (text.includes('toxic') || text.includes('mercury') || text.includes('lead')) {
      return 'D004'; // Toxic
    }
    return 'HAZARDOUS'; // General hazardous
  }

  /**
   * Get appropriate risk level for hazardous materials
   */
  getHazardousRiskLevel(text) {
    if (text.includes('radioactive') || text.includes('explosive') || text.includes('mercury')) {
      return 'EXTREME';
    }
    if (text.includes('medical waste') || text.includes('biohazard') || text.includes('toxic')) {
      return 'HIGH';
    }
    return 'MODERATE';
  }
}