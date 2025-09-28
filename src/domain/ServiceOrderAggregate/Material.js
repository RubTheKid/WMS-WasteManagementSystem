export class Material {
    constructor(
      id,
      description,
      product,
      internalNotes = '',
      aiClassification = null,
      isHazardous = false,
      classificationCode = null,
      riskLevel = null
    ) {
      this.validateDescription(description);
  
      this.id = id;
      this.description = description;
      this.product = product;
      this.internalNotes = internalNotes;
      this.aiClassification = aiClassification;
      this.isHazardous = isHazardous;
      this.classificationCode = classificationCode;
      this.riskLevel = riskLevel;
    }
  
    validateDescription(description) {
      if (!description || description.trim().length < 3) {
        throw new Error('Description must be at least 3 characters long');
      }
    }
  
    updateAIClassification(classification, isHazardous, classificationCode = null, riskLevel = null) {
      return new Material(
        this.id,
        this.description,
        this.product,
        this.internalNotes,
        classification,
        isHazardous,
        classificationCode,
        riskLevel
      );
    }
  
    addInternalNote(note) {
      if (!note || note.trim().length === 0) {
        throw new Error('Note cannot be empty');
      }
      const updatedNotes = this.internalNotes
        ? `${this.internalNotes}\n${new Date().toISOString()}: ${note}`
        : `${new Date().toISOString()}: ${note}`;
  
      return new Material(
        this.id,
        this.description,
        this.product,
        updatedNotes,
        this.aiClassification,
        this.isHazardous,
        this.classificationCode,
        this.riskLevel,
      );
    }
  
  toJSON() {
    return {
      id: this.id,
      description: this.description,
      product: this.product,
      internalNotes: this.internalNotes,
      aiClassification: this.aiClassification,
      isHazardous: this.isHazardous,
      classificationCode: this.classificationCode,
      riskLevel: this.riskLevel,
    };
  }
}
