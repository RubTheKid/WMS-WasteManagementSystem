import React, { useState, useEffect } from 'react';
import type { ServiceOrder } from '../../../types';
import { serviceOrderApi } from '../../../services/api';
import { formatDate, getStatusBadgeClass } from '../../../utils/helpers';
import { EditServiceOrderModal } from '../../../components/modals/EditServiceOrderModal';
import MaterialCard from './MaterialCard';

interface ServiceOrderListProps {
    onRefresh?: () => void;
}

export const ServiceOrderList: React.FC<ServiceOrderListProps> = () => {
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    const handleEditOrder = (order: ServiceOrder) => {
        setEditingOrder(order);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingOrder(null);
    };

    const handleEditSuccess = () => {
        fetchServiceOrders(); // Refresh the list
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
                            onEdit={() => handleEditOrder(order)}
                        />
                    ))}
                </div>
            )}
            
            <EditServiceOrderModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                serviceOrder={editingOrder}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
};

interface ServiceOrderCardProps {
    order: ServiceOrder;
    expanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = ({ order, expanded, onToggleExpand, onEdit }) => {
    const materialsCount = order.materials.length;
    const analyzedMaterials = order.materials.filter(m => m.aiClassification).length;
    const hazardousMaterials = order.materials.filter(m => m.isHazardous).length;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <div className="flex-1 cursor-pointer" onClick={onToggleExpand}>
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

                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                    >
                        ✏️ Edit
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-2" onClick={onToggleExpand}>
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

export default ServiceOrderList;
