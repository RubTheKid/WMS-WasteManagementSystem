export class ServiceOrder {
  constructor(
    id,
    customerName,
    companyName,
    appointmentDate,
    status = ServiceOrderStatus.SCHEDULED,
    createdAt,
    updatedAt,
    materials = []
  ) {
    this.validateCustomerData(customerName, companyName);
    this.validateAppointmentDate(appointmentDate);
    this.validateStatus(status);
    this.validateMaterials(materials);

    this.id = id;
    this.customerName = customerName;
    this.companyName = companyName;
    this.appointmentDate = appointmentDate;
    this.status = status;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.materials = materials;
  }

  validateCustomerData(name, companyName) {
    if (!name || name.trim().length < 2) {
      throw new Error('Customer name must be at least 2 characters long');
    }
    if (!companyName || companyName.trim().length < 2) {
      throw new Error('Company name must be at least 2 characters long');
    }
  }

  validateAppointmentDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error('Invalid appointment date');
    }
    if (date < new Date()) {
      throw new Error('Appointment date cannot be in the past');
    }
  }

  validateStatus(status) {
    if (!Object.values(ServiceOrderStatus).includes(status)) {
      throw new Error('Invalid service order status');
    }
  }

  validateMaterials(materials) {
    if (!Array.isArray(materials)) {
      throw new Error('Materials must be an array');
    }
    materials.forEach(material => {
      if (!material.description || !material.product) {
        throw new Error('Each material must have a description and product');
      }

    });
  }

  canBeProcessed() {
    return this.status === ServiceOrderStatus.PENDING;
  }

  canBeScheduled() {
    return this.status === ServiceOrderStatus.RISK_ANALYZED;
  }

  canBeStarted() {
    return this.status === ServiceOrderStatus.SCHEDULED;
  }

  canBeCompleted() {
    return this.status === ServiceOrderStatus.IN_PROGRESS;
  }

  addMaterial(material) {
    if (!material.description || !material.product) {
      throw new Error('Material must have a description and product');
    }

    return new ServiceOrder(
      this.id,
      this.customerName,
      this.companyName,
      this.appointmentDate,
      this.status,
      this.createdAt,
      new Date(),
      [...this.materials, material]
    );
  }

  markAsProcessing() {
    if (!this.canBeProcessed()) {
      throw new Error('Service order cannot be processed in current status');
    }
    
    return new ServiceOrder(
      this.id,
      this.customerName,
      this.companyName,
      this.appointmentDate,
      ServiceOrderStatus.PROCESSING,
      this.createdAt,
      new Date(),
      this.materials
    );
  }

  markAsRiskAnalyzed() {
    if (this.status !== ServiceOrderStatus.PROCESSING) {
      throw new Error('Service order must be in PROCESSING status to be risk analyzed');
    }
    
    return new ServiceOrder(
      this.id,
      this.customerName,
      this.companyName,
      this.appointmentDate,
      ServiceOrderStatus.RISK_ANALYZED,
      this.createdAt,
      new Date(),
      this.materials
    );
  }

  markAsScheduled(scheduledDate) {
    if (!this.canBeScheduled()) {
      throw new Error('Service order must be risk analyzed before scheduling');
    }
    if (!scheduledDate || !(scheduledDate instanceof Date)) {
      throw new Error('Valid scheduled date must be provided');
    }
    
    const order = new ServiceOrder(
      this.id,
      this.customerName,
      this.companyName,
      scheduledDate,
      ServiceOrderStatus.SCHEDULED,
      this.createdAt,
      new Date(),
      this.materials
    );
    order.scheduledDate = scheduledDate;
    return order;
  }

  markAsInProgress() {
    if (!this.canBeStarted()) {
      throw new Error('Service order must be scheduled before starting');
    }
    
    return new ServiceOrder(
      this.id,
      this.customerName,
      this.companyName,
      this.appointmentDate,
      ServiceOrderStatus.IN_PROGRESS,
      this.createdAt,
      new Date(),
      this.materials
    );
  }

  markAsCompleted() {
    if (!this.canBeCompleted()) {
      throw new Error('Service order must be in progress to be completed');
    }
    
    return new ServiceOrder(
      this.id,
      this.customerName,
      this.companyName,
      this.appointmentDate,
      ServiceOrderStatus.COMPLETED,
      this.createdAt,
      new Date(),
      this.materials
    );
  }

  markAsCancelled(reason) {
    if (this.status === ServiceOrderStatus.COMPLETED) {
      throw new Error('Completed service orders cannot be cancelled');
    }
    
    const order = new ServiceOrder(
      this.id,
      this.customerName,
      this.companyName,
      this.appointmentDate,
      ServiceOrderStatus.CANCELLED,
      this.createdAt,
      new Date(),
      this.materials
    );
    order.cancellationReason = reason;
    return order;
  }

  hasHazardousMaterials() {
    return this.materials.some(material => material.isHazardous);
  }

  calculateTotalRisk(items) {
    if (!items.length) return RiskLevel.LOW;
    
    const riskLevels = items.map(item => item.riskLevel).filter(Boolean);
    if (!riskLevels.length) return RiskLevel.LOW;
    
    if (riskLevels.includes(RiskLevel.CRITICAL)) return RiskLevel.CRITICAL;
    if (riskLevels.includes(RiskLevel.HIGH)) return RiskLevel.HIGH;
    if (riskLevels.includes(RiskLevel.MEDIUM)) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  toJSON() {
    return {
      id: this.id,
      customerName: this.customerName,
      companyName: this.companyName,
      appointmentDate: this.appointmentDate,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      materials: this.materials.map(material => material.toJSON())
    };
  }
}

export const ServiceOrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  RISK_ANALYZED: 'RISK_ANALYZED',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

