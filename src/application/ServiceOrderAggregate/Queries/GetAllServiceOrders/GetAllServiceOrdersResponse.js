export class GetAllServiceOrdersResponse {
    constructor(serviceOrders) {
        this.serviceOrders = serviceOrders.map(order => ({
            id: order.id,
            customerName: order.customerName,
            companyName: order.companyName,
            appointmentDate: order.appointmentDate,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            materials: order.materials.map(material => ({
                id: material.id,
                description: material.description,
                product: material.product,
                internalNotes: material.internalNotes,
                aiClassification: material.aiClassification,
                isHazardous: material.isHazardous,
                classificationCode: material.classificationCode,
                riskLevel: material.riskLevel
            }))
        }));
        this.total = serviceOrders.length;
    }
}
