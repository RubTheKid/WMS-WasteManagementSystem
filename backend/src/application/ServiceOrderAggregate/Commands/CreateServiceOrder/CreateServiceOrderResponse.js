export class CreateServiceOrderResponse {
    constructor(
        id,
        customerName,
        companyName,
        appointmentDate,
        status,
        materials
    ) {
        this.id = id;
        this.customerName = customerName;
        this.companyName = companyName;
        this.appointmentDate = appointmentDate;
        this.status = status;
        this.materials = materials;
    }
}