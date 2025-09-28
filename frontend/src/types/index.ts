
export interface EPAClassification {
    category: string;
    classification: string;
    reasoning: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
    isHazardous: boolean;
}
export interface Material {
    id: string;
    description: string;
    product: ProductType;
    internalNotes: string;
    aiClassification: string | null;
    isHazardous: boolean;
    classificationCode: string | null;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | null;
    fullAnalysis: EPAClassification | null;
}

export interface CreateMaterial {
    description: string;
    product: ProductType;
}
export interface ServiceOrder {
    id: string;
    customerName: string;
    companyName: string;
    appointmentDate: string;
    status: ServiceOrderStatus;
    createdAt: string;
    updatedAt: string;
    materials: Material[];
}

export interface CreateServiceOrder {
    customerName: string;
    companyName: string;
    appointmentDate: string;
    materials: CreateMaterial[];
}

export interface ServiceOrdersResponse {
    serviceOrders: ServiceOrder[];
    total: number;
}
export type ServiceOrderStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ProductType =
    | 'ELECTRONICS'
    | 'CHEMICALS'
    | 'BATTERIES'
    | 'PAINT'
    | 'METAL_SCRAP'
    | 'PLASTIC'
    | 'PAPER'
    | 'GLASS'
    | 'ORGANIC_WASTE'
    | 'CONSTRUCTION_DEBRIS'
    | 'OTHER';

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
    { value: 'ELECTRONICS', label: 'Electronics' },
    { value: 'CHEMICALS', label: 'Chemicals' },
    { value: 'BATTERIES', label: 'Batteries' },
    { value: 'PAINT', label: 'Paint' },
    { value: 'METAL_SCRAP', label: 'Metal Scrap' },
    { value: 'PLASTIC', label: 'Plastic' },
    { value: 'PAPER', label: 'Paper' },
    { value: 'GLASS', label: 'Glass' },
    { value: 'ORGANIC_WASTE', label: 'Organic Waste' },
    { value: 'CONSTRUCTION_DEBRIS', label: 'Construction Debris' },
    { value: 'OTHER', label: 'Other' },
];
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}