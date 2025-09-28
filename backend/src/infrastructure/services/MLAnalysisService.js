import { ClassificationTrainingData } from '../../domain/ClassificationAggregate/ClassificationTrainingData.js';
import { ClassificationResult } from '../../domain/ClassificationAggregate/ClassificationResult.js';

export class MLAnalysisService {
  constructor() {
    this.hazardousKeywords = ClassificationTrainingData.getHazardousKeywords();
    this.nonHazardousKeywords = ClassificationTrainingData.getNonHazardousKeywords();
    this.initializeModel();
  }

  initializeModel() {
    this.hazardousKeywordMap = new Map();
    this.nonHazardousKeywordMap = new Map();
    
    this.hazardousKeywords.forEach(keyword => {
      this.hazardousKeywordMap.set(keyword.toLowerCase(), 1);
    });
    
    this.nonHazardousKeywords.forEach(keyword => {
      this.nonHazardousKeywordMap.set(keyword.toLowerCase(), 1);
    });

    this.modelWeights = {
      keywordMatch: 0.5,
      patternRecognition: 0.3,
      statisticalAnalysis: 0.15,
      contextAnalysis: 0.05
    };

    this.thresholds = {
      hazardous: 0.65,
      highConfidence: 0.75,
      lowConfidence: 0.6
    };
  }

  // Main method for analyzing a single material
  async analyzeMaterial(material) {
    const text = `${material.description} ${material.product}`.toLowerCase();
    const features = this.extractFeatures(text);
    const score = this.applyMLModel(features);
    const confidence = this.calculateConfidence(score, [score]);
    
    const isHazardous = score >= this.thresholds.hazardous;
    const classificationCode = this.getClassificationCode(isHazardous, features);
    const riskLevel = this.getRiskLevel(score);

    return {
      materialId: material.id,
      isHazardous,
      aiClassification: `${isHazardous ? 'Hazardous' : 'Non-Hazardous'} (ML Analysis)`,
      classificationCode,
      riskLevel,
      confidence,
      score,
      source: 'ML Analysis',
      hasHighConfidence: confidence >= this.thresholds.highConfidence
    };
  }

  // Analyze multiple materials for a service order
  classifyServiceOrder(serviceOrder) {
    try {
      if (!serviceOrder.materials || serviceOrder.materials.length === 0) {
        return ClassificationResult.createFallbackResult('No materials to analyze');
      }

      const materials = serviceOrder.materials;
      const classificationScores = [];

      for (const material of materials) {
        const materialScore = this.analyzeMaterialScore(material);
        classificationScores.push(materialScore);
      }

      const finalScore = this.aggregateScores(classificationScores);
      const classification = finalScore >= this.thresholds.hazardous ? 'hazardous' : 'non-hazardous';
      const confidence = this.calculateConfidence(finalScore, classificationScores);

      return new ClassificationResult(
        classification,
        confidence,
        `Service Order ${serviceOrder.id} analysis`,
        `Materials analyzed: ${materials.length}`
      );

    } catch (error) {
      console.error('Error classifying service order:', error);
      return ClassificationResult.createFallbackResult(`Classification error: ${error.message}`);
    }
  }

  // Internal method for getting just the score (used by service order classification)
  analyzeMaterialScore(material) {
    const text = `${material.description} ${material.product}`.toLowerCase();
    const features = this.extractFeatures(text);
    return this.applyMLModel(features);
  }

  extractFeatures(text) {
    const words = text.split(/\s+/);
    const totalWords = words.length;
    
    const hazardousMatches = this.countKeywordMatches(text, this.hazardousKeywordMap);
    const nonHazardousMatches = this.countKeywordMatches(text, this.nonHazardousKeywordMap);
    
    const patterns = this.recognizePatterns(text);
    const statistics = this.performStatisticalAnalysis(text, words);
    const context = this.analyzeContext(text);

    return {
      hazardousMatches,
      nonHazardousMatches,
      totalWords,
      patterns,
      statistics,
      context
    };
  }

  countKeywordMatches(text, keywordMap) {
    let matches = 0;
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (keywordMap.has(cleanWord.toLowerCase())) {
        matches++;
      }
    });
    
    keywordMap.forEach((_, keyword) => {
      if (text.includes(keyword)) {
        matches++;
      }
    });
    
    return matches;
  }

  recognizePatterns(text) {
    const patterns = {
      chemicalFormulas: (text.match(/[A-Z][a-z]?\d*/g) || []).length,
      percentages: (text.match(/\d+%/g) || []).length,
      temperatures: (text.match(/\d+°[CF]/g) || []).length,
      measurements: (text.match(/\d+\s*(mg|g|kg|ml|l|ppm|ppb)/gi) || []).length,
      hazardSymbols: (text.match(/\b(flammable|toxic|corrosive|explosive|radioactive|biohazard)\b/gi) || []).length,
      safetyTerms: (text.match(/\b(msds|sds|safety|warning|caution|danger)\b/gi) || []).length,
      glowPatterns: (text.match(/\b(glow|glowing|phosphorescent|luminescent|fluorescent|bright|neon)\b/gi) || []).length,
      liquidPatterns: (text.match(/\b(drops|liquid|solution|concentrate|residue|fluid)\b/gi) || []).length,
      suspiciousPatterns: (text.match(/\b(unknown|mystery|suspicious|contaminated|colored|dyed|stained)\b/gi) || []).length,
      radioactivePatterns: (text.match(/\b(radioactive|radiation|nuclear|atomic|isotope|uranium|plutonium|cesium|radium)\b/gi) || []).length
    };
    
    return patterns;
  }

  performStatisticalAnalysis(text, words) {
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const uniqueWords = new Set(words).size;
    const lexicalDiversity = uniqueWords / words.length;
    
    const technicalTerms = words.filter(word => 
      word.length > 6 && 
      /[A-Z]/.test(word) && 
      /[a-z]/.test(word)
    ).length;
    
    return {
      avgWordLength,
      lexicalDiversity,
      technicalTerms,
      textLength: text.length
    };
  }

  analyzeContext(text) {
    const contextScores = {
      industrial: this.calculateContextScore(text, ['industrial', 'manufacturing', 'factory', 'plant', 'facility']),
      medical: this.calculateContextScore(text, ['medical', 'pharmaceutical', 'hospital', 'clinical', 'therapeutic']),
      laboratory: this.calculateContextScore(text, ['laboratory', 'lab', 'research', 'testing', 'analysis']),
      automotive: this.calculateContextScore(text, ['automotive', 'car', 'vehicle', 'engine', 'motor']),
      construction: this.calculateContextScore(text, ['construction', 'building', 'concrete', 'cement', 'paint']),
      electronic: this.calculateContextScore(text, ['electronic', 'battery', 'circuit', 'component', 'device'])
    };
    
    return contextScores;
  }

  calculateContextScore(text, keywords) {
    return keywords.reduce((score, keyword) => {
      return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0) / keywords.length;
  }

  calculateContextWeight(features) {
    const context = features.context;
    const hazardousContexts = context.industrial + context.laboratory + context.medical;
    const totalContexts = Object.values(context).reduce((sum, score) => sum + score, 0);
    
    if (totalContexts === 0) return 0.3;
    
    return Math.min(1.0, (hazardousContexts / totalContexts) * 1.2);
  }

  applyMLModel(features) {
    const keywordScore = this.calculateKeywordScore(features);
    const patternScore = this.calculatePatternScore(features);
    const statisticalScore = this.calculateStatisticalScore(features);
    const contextScore = this.calculateContextWeight(features);
    
    const weightedScore = 
      keywordScore * this.modelWeights.keywordMatch +
      patternScore * this.modelWeights.patternRecognition +
      statisticalScore * this.modelWeights.statisticalAnalysis +
      contextScore * this.modelWeights.contextAnalysis;
    
    // Apply special rules for highly suspicious combinations
    const suspiciousScore = this.calculateSuspiciousCombinationScore(features);
    const finalScore = Math.max(weightedScore, suspiciousScore);
    
    return Math.min(1.0, Math.max(0.0, finalScore));
  }

  calculateKeywordScore(features) {
    const hazardousRatio = features.hazardousMatches / Math.max(1, features.totalWords);
    const nonHazardousRatio = features.nonHazardousMatches / Math.max(1, features.totalWords);
    
    const netRatio = hazardousRatio - (nonHazardousRatio * 0.5);
    return Math.min(1.0, Math.max(0.0, netRatio * 10));
  }

  calculatePatternScore(features) {
    const patterns = features.patterns;
    const totalPatterns = Object.values(patterns).reduce((sum, count) => sum + count, 0);
    const hazardousPatterns = patterns.chemicalFormulas + patterns.hazardSymbols + patterns.safetyTerms;
    
    const enhancedHazardousPatterns = 
      patterns.glowPatterns * 2.0 +      
      patterns.liquidPatterns * 1.5 +     
      patterns.suspiciousPatterns * 1.8 + 
      patterns.radioactivePatterns * 3.0 +
      hazardousPatterns;                  
    
    if (totalPatterns === 0) return 0.3;
    
    const hazardousRatio = enhancedHazardousPatterns / Math.max(totalPatterns, 1);
    return Math.min(1.0, hazardousRatio * 1.5);
  }

  calculateStatisticalScore(features) {
    const stats = features.statistics;
    let score = 0.3;
    
    if (stats.avgWordLength > 7) score += 0.2;
    if (stats.lexicalDiversity < 0.7) score += 0.1;
    if (stats.technicalTerms > 2) score += 0.3;
    if (stats.textLength > 100) score += 0.1;
    
    return Math.min(1.0, score);
  }

  calculateSuspiciousCombinationScore(features) {
    const patterns = features.patterns;
    let suspiciousScore = 0;
    
    if (patterns.glowPatterns > 0 && patterns.liquidPatterns > 0) {
      suspiciousScore = Math.max(suspiciousScore, 0.9);
    }
    
    if (patterns.glowPatterns > 0 && patterns.suspiciousPatterns > 0) {
      suspiciousScore = Math.max(suspiciousScore, 0.85);
    }
    
    if (patterns.liquidPatterns > 0 && patterns.suspiciousPatterns > 0) {
      suspiciousScore = Math.max(suspiciousScore, 0.8);
    }
    
    if (patterns.radioactivePatterns > 0) {
      suspiciousScore = Math.max(suspiciousScore, 0.95);
    }
    
    const suspiciousIndicators = patterns.glowPatterns + patterns.suspiciousPatterns + patterns.liquidPatterns;
    if (suspiciousIndicators >= 2) {
      suspiciousScore = Math.max(suspiciousScore, 0.7 + (suspiciousIndicators - 2) * 0.1);
    }
    
    return Math.min(1.0, suspiciousScore);
  }

  aggregateScores(scores) {
    if (scores.length === 0) return 0;
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const maximum = Math.max(...scores);
    const minimum = Math.min(...scores);
    
    return (average * 0.6) + (maximum * 0.3) + (minimum * 0.1);
  }

  calculateConfidence(finalScore, individualScores) {
    if (individualScores.length === 0) return 0.5;
    
    const baseConfidence = Math.abs(finalScore - 0.5) * 2;
    const consistency = this.calculateConsistency(individualScores);
    const distanceFromBoundary = this.calculateDistanceFromBoundary(finalScore);
    const materialCountBoost = Math.min(0.1, individualScores.length * 0.02);
    
    let confidence = baseConfidence * 0.4 + consistency * 0.3 + distanceFromBoundary * 0.2 + materialCountBoost;
    
    // Confidence boosting strategies
    confidence = this.applyConfidenceBoosts(confidence, finalScore, individualScores);
    
    // Reduce confidence for suspicious patterns to trigger AI analysis
    confidence = this.applySuspiciousPatternConfidenceReduction(confidence, finalScore);
    
    return Math.min(0.99, Math.max(0.1, confidence));
  }

  calculateConsistency(scores) {
    if (scores.length <= 1) return 0.5;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    return Math.max(0, 1 - (standardDeviation * 2));
  }

  calculateDistanceFromBoundary(score) {
    const distanceFromHazardous = Math.abs(score - this.thresholds.hazardous);
    return Math.min(1.0, distanceFromHazardous * 3);
  }

  applyConfidenceBoosts(baseConfidence, finalScore, individualScores) {
    let boostedConfidence = baseConfidence;
    
    // High consensus boost
    const aboveThreshold = individualScores.filter(s => s >= this.thresholds.hazardous).length;
    const belowThreshold = individualScores.length - aboveThreshold;
    const consensus = Math.max(aboveThreshold, belowThreshold) / individualScores.length;
    
    if (consensus >= 0.8) {
      boostedConfidence *= 1.2;
    }
    
    // Extreme score boost
    if (finalScore > 0.8 || finalScore < 0.2) {
      boostedConfidence *= 1.15;
    }
    
    // Pattern recognition boost
    const hasStrongPatterns = individualScores.some(score => score > 0.85 || score < 0.15);
    if (hasStrongPatterns) {
      boostedConfidence *= 1.1;
    }
    
    return boostedConfidence;
  }

  applySuspiciousPatternConfidenceReduction(confidence, finalScore) {
    if (finalScore >= 0.7 && finalScore < 0.95) {
      return Math.min(confidence, 0.6);
    }
   
    if (finalScore >= 0.95) {
      return confidence;
    }
    
    return confidence;
  }

  getClassificationCode(isHazardous, features) {
    if (!isHazardous) return 'NON-HAZARDOUS';
    
   
    const patterns = features.patterns;
    
    if (patterns.chemicalFormulas > 0 || patterns.hazardSymbols > 0) {
      if (features.context.industrial > 0.5) return 'D002'; // Corrosive
      if (patterns.temperatures > 0) return 'D001'; // Ignitable
      return 'D003'; // Reactive
    }
    
    return 'HAZARDOUS';
  }

  getRiskLevel(score) {
    if (score >= 0.8) return 'HIGH';
    if (score >= 0.65) return 'MODERATE';
    if (score >= 0.4) return 'LOW';
    return 'MINIMAL';
  }
}
