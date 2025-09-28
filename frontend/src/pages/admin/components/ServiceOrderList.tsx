import React, { useState, useEffect } from 'react';
import type { ServiceOrder, Material } from '../../../types';
import { serviceOrderApi } from '../../../services/api';
import { formatDate, getHazardBadgeClass, getClassificationBadgeClass, getStatusBadgeClass } from '../../../utils/helpers';

interface ServiceOrderListProps {
    onRefresh?: () => void;
}

export const ServiceOrderList: React.FC<ServiceOrderListProps> = () => {
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const fetchServiceOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await serviceOrderApi.getAll();
            
            if (response && Array.isArray(response.serviceOrders)) {
                setServiceOrders(response.serviceOrders);
            } else if (response && Array.isArray(response)) {
                setServiceOrders(response);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            setError('Failed to fetch service orders');
            console.error('Error fetching service orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceOrders();
    }, []);


    const toggleOrderExpansion = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 bg-red-50 border-red-200">
                <p className="text-red-600">{error}</p>
                <button onClick={fetchServiceOrders} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mt-4">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Service Orders ({serviceOrders.length})</h2>
                <div className="space-x-3">
                    <button onClick={fetchServiceOrders} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {serviceOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center py-12">
                    <p className="text-gray-500 text-lg">No service orders found</p>
                    <p className="text-gray-400">Create your first service order to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {serviceOrders.map((order) => (
                        <ServiceOrderCard
                            key={order.id}
                            order={order}
                            expanded={expandedOrder === order.id}
                            onToggleExpand={() => toggleOrderExpansion(order.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface ServiceOrderCardProps {
    order: ServiceOrder;
    expanded: boolean;
    onToggleExpand: () => void;
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order, expanded, onToggleExpand }) => {
    const materialsCount = order.materials.length;
    const analyzedMaterials = order.materials.filter(m => m.aiClassification).length;
    const hazardousMaterials = order.materials.filter(m => m.isHazardous).length;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start cursor-pointer" onClick={onToggleExpand}>
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.companyName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-1">Customer: {order.customerName}</p>
                    <p className="text-gray-600 mb-3">Appointment: {formatDate(order.appointmentDate)}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📦 {materialsCount} materials</span>
                        <span>🔍 {analyzedMaterials}/{materialsCount} analyzed</span>
                        {hazardousMaterials > 0 && (
                            <span className="text-red-600">⚠️ {hazardousMaterials} hazardous</span>
                        )}
                    </div>
                </div>

                <button className="text-gray-400 hover:text-gray-600 p-2">
                    <svg
                        className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {expanded && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Materials ({materialsCount}):</h4>
                    <div className="space-y-4">
                        {order.materials.map((material) => (
                            <MaterialCard key={material.id} material={material} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const MaterialCard: React.FC<{ material: Material }> = ({ material }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <p className="font-medium text-gray-900">{material.description}</p>
                    <p className="text-sm text-gray-600 mt-1">Product: {material.product}</p>
                    {material.internalNotes && (
                        <p className="text-sm text-gray-500 mt-1 italic">Notes: {material.internalNotes}</p>
                    )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                    {material.riskLevel && (
                        <span className={getHazardBadgeClass(material.riskLevel)}>
                            {material.riskLevel}
                        </span>
                    )}
                    {material.classificationCode && (
                        <span className={getClassificationBadgeClass(material.classificationCode)}>
                            {material.classificationCode}
                        </span>
                    )}
                    {material.isHazardous !== null && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            material.isHazardous 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                        }`}>
                            {material.isHazardous ? '⚠️ Hazardous' : '✅ Non-Hazardous'}
                        </span>
                    )}
                </div>
            </div>

            {material.aiClassification && (
                <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm text-gray-700">
                        <strong>AI Analysis:</strong> {material.aiClassification}
                    </p>

                    {material.fullAnalysis && (
                        <div className="mt-2 text-xs text-gray-600">
                            <p><strong>Category:</strong> {material.fullAnalysis.category}</p>
                            <p><strong>Reasoning:</strong> {material.fullAnalysis.reasoning}</p>
                        </div>
                    )}
                </div>
            )}

            {!material.aiClassification && (
                <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-700">⏳ Pending AI analysis</p>
                </div>
            )}
        </div>
    );
};


export default ServiceOrderList;
