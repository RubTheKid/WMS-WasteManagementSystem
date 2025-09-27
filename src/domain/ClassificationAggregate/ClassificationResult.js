export class ClassificationResult {
  constructor(classification, confidence,  originalText = '', normalizedText = '') {
    this.validateClassification(classification);
    this.validateConfidence(confidence);

    this.classification = classification;
    this.confidence = confidence;
    this.originalText = originalText;
    this.normalizedText = normalizedText;
    this.timestamp = new Date();
  }

  validateClassification(classification) {
    const validClassifications = ['hazardous', 'non-hazardous'];
    if (!validClassifications.includes(classification)) {
      throw new Error(`Invalid classification: ${classification}. Must be one of: ${validClassifications.join(', ')}`);
    }
  }

  validateConfidence(confidence) {
    if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
      throw new Error(`Invalid confidence: ${confidence}. Must be a number between 0 and 1`);
    }
  }

  isHazardous() {
    return this.classification === 'hazardous';
  }

  isHighConfidence() {
    return this.confidence >= 0.8;
  }

  isLowConfidence() {
    return this.confidence < 0.6;
  }

  toJSON() {
    return {
      classification: this.classification,
      confidence: this.confidence,
      originalText: this.originalText,
      normalizedText: this.normalizedText,
      timestamp: this.timestamp
    };
  }

  static createFallbackResult(reason = 'Classification failed, defaulting to non-hazardous') {
    return new ClassificationResult(
      'non-hazardous',
      0.5,
      reason,
      '',
      ''
    );
  }
}
