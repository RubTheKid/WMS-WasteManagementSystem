export class CreateServiceOrderCommand {
  constructor(
    customerName,
    companyName,
    appointmentDate,
    materials
  ) {
    this.customerName = customerName;
    this.companyName = companyName;
    this.appointmentDate = new Date(appointmentDate);
    this.materials = materials;
  }
}

export class CreateMaterialCommand {
  constructor(
    description,
    product
  ) {
    this.description = description;
    this.product = product;
  }
}