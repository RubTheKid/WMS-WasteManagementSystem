export class WasteItem {
  constructor(
    id,
    serviceOrderId,
    itemName,
    quantity,
    unit,
    createdAt,
    updatedAt,
    description,
    riskLevel,
    riskAnalysis,
    aiProcessed = false
  ) {
    this.validateQuantity(quantity);
    this.validateUnit(unit);
    if (riskLevel) this.validateRiskLevel(riskLevel);

    this.id = id;
    this.serviceOrderId = serviceOrderId;
    this.itemName = itemName;
    this.quantity = quantity;
    this.unit = unit;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.description = description;
    this.riskLevel = riskLevel;
    this.riskAnalysis = riskAnalysis;
    this.aiProcessed = aiProcessed;
  }

  validateQuantity(quantity) {
    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
  }

  validateUnit(unit) {
    if (!Object.values(UnitType).includes(unit)) {
      throw new Error('Invalid unit type');
    }
  }

  validateRiskLevel(riskLevel) {
    if (!Object.values(RiskLevel).includes(riskLevel)) {
      throw new Error('Invalid risk level');
    }
  }

  isProcessedByAI() {
    return this.aiProcessed;
  }

  hasRiskAnalysis() {
    return !!this.riskLevel && !!this.riskAnalysis;
  }

  updateRiskAnalysis(riskLevel, analysis) {
    this.validateRiskLevel(riskLevel);
    if (!analysis || typeof analysis !== 'string') {
      throw new Error('Risk analysis must be provided as a string');
    }

    return new WasteItem(
      this.id,
      this.serviceOrderId,
      this.itemName,
      this.quantity,
      this.unit,
      this.createdAt,
      new Date(),
      this.description,
      riskLevel,
      analysis,
      true
    );
  }

  isHighRisk() {
    return this.riskLevel === RiskLevel.HIGH || this.riskLevel === RiskLevel.CRITICAL;
  }

  toJSON() {
    return {
      id: this.id,
      serviceOrderId: this.serviceOrderId,
      itemName: this.itemName,
      quantity: this.quantity,
      unit: this.unit,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      description: this.description,
      riskLevel: this.riskLevel,
      riskAnalysis: this.riskAnalysis,
      aiProcessed: this.aiProcessed
    };
  }
}

export const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const UnitType = {
  KG: 'KG',
  LITER: 'LITER',
  UNIT: 'UNIT',
  TON: 'TON',
  M3: 'M3'
};
