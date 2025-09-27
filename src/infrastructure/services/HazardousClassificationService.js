import { ClassificationTrainingData } from '../../domain/ClassificationAggregate/ClassificationTrainingData.js';
import { ClassificationResult } from '../../domain/ClassificationAggregate/ClassificationResult.js';

export class HazardousClassificationService {
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

  classifyServiceOrder(serviceOrder) {
    try {
      if (!serviceOrder.materials || serviceOrder.materials.length === 0) {
        return ClassificationResult.createFallbackResult('No materials to analyze');
      }

      const materials = serviceOrder.materials;
      const classificationScores = [];

      for (const material of materials) {
        const materialScore = this.analyzeMaterial(material);
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

  analyzeMaterial(material) {
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
    
    for (const word of words) {
      if (keywordMap.has(word)) {
        matches++;
      }
    }
    
    for (let i = 0; i < words.length - 1; i++) {
      const phrase2 = `${words[i]} ${words[i + 1]}`;
      if (keywordMap.has(phrase2)) {
        matches += 2;
      }
      
      if (i < words.length - 2) {
        const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (keywordMap.has(phrase3)) {
          matches += 3;
        }
      }
    }
    
    for (const keyword of keywordMap.keys()) {
      if (text.includes(keyword)) {
        matches += 0.5;
      }
    }
    
    return matches;
  }

  recognizePatterns(text) {
    const patterns = {
      chemicalFormulas: 0,
      concentrationIndicators: 0,
      hazardSymbols: 0,
      regulatoryCodes: 0,
      warningWords: 0
    };

    patterns.chemicalFormulas = (text.match(/[A-Z][a-z]?\d*[A-Z][a-z]?\d*/g) || []).length;
    patterns.concentrationIndicators = (text.match(/\d+%|\d+\s*ppm|\d+\s*mg\/L|\d+\s*mg\/kg/g) || []).length;
    patterns.hazardSymbols = (text.match(/flammable|explosive|toxic|corrosive|oxidizer|environmental hazard/gi) || []).length;
    patterns.regulatoryCodes = (text.match(/[DFKPU]\d{3}/g) || []).length;
    patterns.warningWords = (text.match(/warning|caution|danger|hazard|poison|toxic|harmful/gi) || []).length;

    return patterns;
  }

  performStatisticalAnalysis(text, words) {
    const stats = {
      avgWordLength: 0,
      specialCharRatio: 0,
      numberRatio: 0,
      uppercaseRatio: 0,
      technicalTermRatio: 0
    };

    if (words.length > 0) {
      stats.avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      stats.specialCharRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
      stats.numberRatio = (text.match(/\d/g) || []).length / text.length;
      stats.uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
      stats.technicalTermRatio = words.filter(word => /\d|[^a-zA-Z]/.test(word)).length / words.length;
    }

    return stats;
  }

  analyzeContext(text) {
    const context = {
      industryContext: 0,
      disposalContext: 0,
      safetyContext: 0,
      regulatoryContext: 0
    };

    const industryTerms = ['industrial', 'manufacturing', 'chemical', 'petroleum', 'pharmaceutical', 'laboratory'];
    context.industryContext = industryTerms.filter(term => text.includes(term)).length;
    
    const disposalTerms = ['disposal', 'waste', 'treatment', 'recycling', 'landfill', 'incineration'];
    context.disposalContext = disposalTerms.filter(term => text.includes(term)).length;
    
    const safetyTerms = ['safety', 'protective', 'equipment', 'ppe', 'ventilation', 'containment'];
    context.safetyContext = safetyTerms.filter(term => text.includes(term)).length;
    
    const regulatoryTerms = ['epa', 'rcra', 'dot', 'osha', 'regulation', 'compliance', 'permit'];
    context.regulatoryContext = regulatoryTerms.filter(term => text.includes(term)).length;

    return context;
  }

  applyMLModel(features) {
    let score = 0;

    const keywordScore = this.calculateKeywordScore(features);
    score += keywordScore * this.modelWeights.keywordMatch;

    const patternScore = this.calculatePatternScore(features.patterns);
    score += patternScore * this.modelWeights.patternRecognition;

    const statisticalScore = this.calculateStatisticalScore(features.statistics);
    score += statisticalScore * this.modelWeights.statisticalAnalysis;

    const contextScore = this.calculateContextScore(features.context);
    score += contextScore * this.modelWeights.contextAnalysis;

    return Math.min(Math.max(score, 0), 1);
  }

  calculateKeywordScore(features) {
    const totalMatches = features.hazardousMatches + features.nonHazardousMatches;
    
    if (totalMatches === 0) return 0.5;
    
    const hazardousRatio = features.hazardousMatches / totalMatches;
    const nonHazardousRatio = features.nonHazardousMatches / totalMatches;
    
    if (features.hazardousMatches > 0) {
      return Math.min(0.6 + (hazardousRatio * 0.4), 1);
    }
    
    if (features.nonHazardousMatches > 0) {
      return Math.max(0.4 - (nonHazardousRatio * 0.4), 0);
    }
    
    return 0.5;
  }

  calculatePatternScore(patterns) {
    let score = 0.5;
    
    if (patterns.chemicalFormulas > 0) score += 0.25;
    if (patterns.concentrationIndicators > 0) score += 0.2;
    if (patterns.hazardSymbols > 0) score += 0.3;
    if (patterns.regulatoryCodes > 0) score += 0.25;
    if (patterns.warningWords > 0) score += 0.15;
    
    return Math.min(Math.max(score, 0), 1);
  }

  calculateStatisticalScore(statistics) {
    let score = 0.5;
    
    if (statistics.technicalTermRatio > 0.3) score += 0.2;
    if (statistics.specialCharRatio > 0.1) score += 0.1;
    if (statistics.numberRatio > 0.1) score += 0.1;
    if (statistics.uppercaseRatio > 0.2) score += 0.1;
    
    return Math.min(Math.max(score, 0), 1);
  }

  calculateContextScore(context) {
    let score = 0.5;
    
    if (context.industryContext > 0) score += 0.2;
    if (context.disposalContext > 0) score += 0.1;
    if (context.safetyContext > 0) score += 0.15;
    if (context.regulatoryContext > 0) score += 0.2;
    
    return Math.min(Math.max(score, 0), 1);
  }

  aggregateScores(scores) {
    if (scores.length === 0) return 0.5;
    
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return (maxScore * 0.7) + (avgScore * 0.3);
  }

  calculateConfidence(finalScore, individualScores) {
    if (individualScores.length === 0) return 0.5;
    
    const mean = individualScores.reduce((sum, score) => sum + score, 0) / individualScores.length;
    const variance = individualScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / individualScores.length;
    const standardDeviation = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 1 - standardDeviation);
    
    const distanceFromBoundary = Math.abs(finalScore - 0.5);
    const boundaryScore = distanceFromBoundary * 2;
    
    const classificationBoost = finalScore > 0.8 || finalScore < 0.2 ? 0.2 : 0.1;
    const materialCountBoost = this.calculateMaterialCountBoost(individualScores.length);
    const distributionBoost = this.calculateDistributionBoost(individualScores, finalScore);
    const extremeScoreBoost = this.calculateExtremeScoreBoost(finalScore);
    const consensusBoost = this.calculateConsensusBoost(individualScores, finalScore);
    const keywordDensityBoost = this.calculateKeywordDensityBoost(individualScores);
    
    const baseConfidence = 0.3;
    const strongClassificationMultiplier = finalScore > 0.8 || finalScore < 0.2 ? 1.3 : 1.0;
    const materialCountMultiplier = individualScores.length >= 4 ? 1.2 : 
                                   individualScores.length >= 2 ? 1.1 : 1.0;
    const consensusMultiplier = this.calculateConsensusMultiplier(individualScores, finalScore);
    
    const rawConfidence = (
      consistencyScore * 0.2 +
      boundaryScore * 0.25 +
      classificationBoost +
      materialCountBoost * 0.1 +
      distributionBoost * 0.1 +
      extremeScoreBoost * 0.1 +
      consensusBoost * 0.05 +
      keywordDensityBoost * 0.05
    );
    
    const confidence = Math.max(
      baseConfidence,
      rawConfidence * strongClassificationMultiplier * materialCountMultiplier * consensusMultiplier
    );
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  calculateMaterialCountBoost(materialCount) {
    if (materialCount === 0) return 0;
    if (materialCount === 1) return 0.05;
    if (materialCount <= 3) return 0.1;
    if (materialCount <= 5) return 0.15;
    return 0.2;
  }

  calculateDistributionBoost(scores, finalScore) {
    const highScores = scores.filter(s => s > 0.7).length;
    const lowScores = scores.filter(s => s < 0.3).length;
    const totalScores = scores.length;
    
    if (finalScore > 0.5 && highScores / totalScores > 0.6) {
      return 0.15;
    }
    if (finalScore < 0.5 && lowScores / totalScores > 0.6) {
      return 0.15;
    }
    
    return 0.05;
  }

  calculateExtremeScoreBoost(finalScore) {
    if (finalScore >= 0.9) return 0.2;
    if (finalScore <= 0.1) return 0.2;
    if (finalScore >= 0.8) return 0.15;
    if (finalScore <= 0.2) return 0.15;
    return 0.05;
  }

  calculateConsensusBoost(scores, finalScore) {
    const threshold = 0.5;
    const hazardousCount = scores.filter(s => s > threshold).length;
    const nonHazardousCount = scores.filter(s => s < threshold).length;
    const totalCount = scores.length;
    
    const consensusRatio = Math.max(hazardousCount, nonHazardousCount) / totalCount;
    
    if (consensusRatio >= 0.8) return 0.15;
    if (consensusRatio >= 0.6) return 0.1;
    return 0.05;
  }

  calculateKeywordDensityBoost(scores) {
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (avgScore > 0.8) return 0.15;
    if (avgScore > 0.6) return 0.1;
    if (avgScore > 0.4) return 0.05;
    return 0;
  }

  calculateConsensusMultiplier(scores, finalScore) {
    const threshold = 0.5;
    const hazardousCount = scores.filter(s => s > threshold).length;
    const nonHazardousCount = scores.filter(s => s < threshold).length;
    const totalCount = scores.length;
    
    const consensusRatio = Math.max(hazardousCount, nonHazardousCount) / totalCount;
    
    if (consensusRatio >= 0.8) return 1.25;
    if (consensusRatio >= 0.6) return 1.15;
    if (consensusRatio >= 0.5) return 1.05;
    return 1.0;
  }

  getConfidenceBreakdown(finalScore, individualScores) {
    if (individualScores.length === 0) return { total: 0.5, components: {} };
    
    const mean = individualScores.reduce((sum, score) => sum + score, 0) / individualScores.length;
    const variance = individualScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / individualScores.length;
    const standardDeviation = Math.sqrt(variance);
    const consistencyScore = Math.max(0, 1 - standardDeviation);
    
    const distanceFromBoundary = Math.abs(finalScore - 0.5);
    const boundaryScore = distanceFromBoundary * 2;
    
    const classificationBoost = finalScore > 0.8 || finalScore < 0.2 ? 0.2 : 0.1;
    const materialCountBoost = this.calculateMaterialCountBoost(individualScores.length);
    const distributionBoost = this.calculateDistributionBoost(individualScores, finalScore);
    const extremeScoreBoost = this.calculateExtremeScoreBoost(finalScore);
    const consensusBoost = this.calculateConsensusBoost(individualScores, finalScore);
    const keywordDensityBoost = this.calculateKeywordDensityBoost(individualScores);
    
    const baseConfidence = 0.3;
    const strongClassificationMultiplier = finalScore > 0.8 || finalScore < 0.2 ? 1.3 : 1.0;
    const materialCountMultiplier = individualScores.length >= 4 ? 1.2 : 
                                   individualScores.length >= 2 ? 1.1 : 1.0;
    const consensusMultiplier = this.calculateConsensusMultiplier(individualScores, finalScore);
    
    const rawConfidence = (
      consistencyScore * 0.2 +
      boundaryScore * 0.25 +
      classificationBoost +
      materialCountBoost * 0.1 +
      distributionBoost * 0.1 +
      extremeScoreBoost * 0.1 +
      consensusBoost * 0.05 +
      keywordDensityBoost * 0.05
    );
    
    const totalConfidence = Math.max(
      baseConfidence,
      rawConfidence * strongClassificationMultiplier * materialCountMultiplier * consensusMultiplier
    );
    
    return {
      total: Math.min(Math.max(totalConfidence, 0), 1),
      components: {
        consistency: consistencyScore * 0.2,
        boundaryDistance: boundaryScore * 0.25,
        classificationBoost: classificationBoost,
        materialCount: materialCountBoost * 0.1,
        distribution: distributionBoost * 0.1,
        extremeScore: extremeScoreBoost * 0.1,
        consensus: consensusBoost * 0.05,
        keywordDensity: keywordDensityBoost * 0.05
      },
      multipliers: {
        strongClassification: strongClassificationMultiplier,
        materialCount: materialCountMultiplier,
        consensus: consensusMultiplier,
        baseConfidence: baseConfidence
      },
      rawScores: {
        consistencyScore,
        boundaryScore,
        classificationBoost,
        materialCountBoost,
        distributionBoost,
        extremeScoreBoost,
        consensusBoost,
        keywordDensityBoost,
        rawConfidence
      }
    };
  }

  getModelMetrics() {
    return {
      modelWeights: this.modelWeights,
      thresholds: this.thresholds,
      keywordCounts: {
        hazardous: this.hazardousKeywords.length,
        nonHazardous: this.nonHazardousKeywords.length
      },
      targetAccuracy: 0.9,
      modelType: 'Rule-based ML Ensemble',
      confidenceStrategies: [
        'Consistency Analysis (20%)',
        'Distance from Decision Boundary (25%)',
        'Clear Classification Boost (15%)',
        'Material Count Confidence (10%)',
        'Score Distribution Analysis (10%)',
        'Extreme Score Boost (10%)',
        'Consensus Boost (5%)',
        'Keyword Density Boost (5%)'
      ]
    };
  }

  updateModelParameters(newWeights, newThresholds) {
    if (newWeights) {
      this.modelWeights = { ...this.modelWeights, ...newWeights };
    }
    if (newThresholds) {
      this.thresholds = { ...this.thresholds, ...newThresholds };
    }
  }
}