import OpenAI from 'openai';

export class MaterialAnalysisService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
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

      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-5-nano",
        temperature: 0.1, 
      });

      const response = completion.choices[0].message.content;


      let classificationData;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          classificationData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', response);

        const isHazardous = response.toLowerCase().includes('true') ||
          response.toLowerCase().includes('hazardous') ||
          response.toLowerCase().includes('d001') ||
          response.toLowerCase().includes('d002') ||
          response.toLowerCase().includes('d003');

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
        riskLevel: classificationData.riskLevel
      };
    } catch (error) {
      console.error(`Error analyzing material ${material.id}:`, error);
      throw error;
    }
  }
}