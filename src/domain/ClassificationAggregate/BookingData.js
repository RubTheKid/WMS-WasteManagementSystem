export class BookingData {
  constructor(description, product, internalNotes, customerName, companyName, materials = []) {
    this.description = description || '';
    this.product = product || 'OTHER';
    this.internalNotes = internalNotes || '';
    this.customerName = customerName || '';
    this.companyName = companyName || '';
    this.materials = Array.isArray(materials) ? materials : [];
  }

  extractTextContent() {
    const textParts = [];

    if (this.description) textParts.push(this.description);
    if (this.product) textParts.push(this.product);
    if (this.internalNotes) textParts.push(this.internalNotes);
    if (this.customerName) textParts.push(this.customerName);
    if (this.companyName) textParts.push(this.companyName);

    this.materials.forEach(material => {
      if (material.description) textParts.push(material.description);
      if (material.product) textParts.push(material.product);
      if (material.internalNotes) textParts.push(material.internalNotes);
    });

    return textParts.join(' ').toLowerCase();
  }

  hasMaterials() {
    return this.materials.length > 0;
  }

  getMaterialDescriptions() {
    return this.materials.map(m => m.description).filter(Boolean);
  }

  toJSON() {
    return {
      description: this.description,
      product: this.product,
      internalNotes: this.internalNotes,
      customerName: this.customerName,
      companyName: this.companyName,
      materials: this.materials
    };
  }

  static fromObject(obj) {
    return new BookingData(
      obj.description,
      obj.product,
      obj.internalNotes,
      obj.customerName,
      obj.companyName,
      obj.materials
    );
  }
}
