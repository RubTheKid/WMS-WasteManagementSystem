export class UpdateServiceOrderCommand {
  constructor(serviceOrderId, customerName, companyName, appointmentDate, status, materials) {
    this.serviceOrderId = serviceOrderId;
    this.customerName = customerName;
    this.companyName = companyName;
    this.appointmentDate = appointmentDate;
    this.status = status;
    this.materials = materials; // Array of materials with potential updates
  }
}
