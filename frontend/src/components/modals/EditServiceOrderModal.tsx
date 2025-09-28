import React, { useState, useEffect } from 'react';
import type { ServiceOrder, Material, ServiceOrderStatus } from '../../types';
import { serviceOrderApi } from '../../services/api';

interface EditServiceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceOrder: ServiceOrder | null;
    onSuccess: () => void;
}

const SERVICE_ORDER_STATUSES: { value: ServiceOrderStatus; label: string }[] = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

export const EditServiceOrderModal: React.FC<EditServiceOrderModalProps> = ({
    isOpen,
    onClose,
    serviceOrder,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        customerName: '',
        companyName: '',
        appointmentDate: '',
        status: 'SCHEDULED' as ServiceOrderStatus,
    });
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form data when service order changes
    useEffect(() => {
        if (serviceOrder) {
            setFormData({
                customerName: serviceOrder.customerName,
                companyName: serviceOrder.companyName,
                appointmentDate: new Date(serviceOrder.appointmentDate).toISOString().slice(0, 16), // Format for datetime-local input
                status: serviceOrder.status,
            });
            setMaterials([...serviceOrder.materials]);
        }
    }, [serviceOrder]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMaterialNotesChange = (materialId: string, notes: string) => {
        setMaterials(prev => prev.map(material => 
            material.id === materialId 
                ? { ...material, internalNotes: notes }
                : material
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceOrder) return;

        setLoading(true);
        setError(null);

        try {
            const updateData = {
                customerName: formData.customerName,
                companyName: formData.companyName,
                appointmentDate: new Date(formData.appointmentDate).toISOString(),
                status: formData.status,
                materials: materials.map(material => ({
                    id: material.id,
                    internalNotes: material.internalNotes || ''
                }))
            };

            await serviceOrderApi.update(serviceOrder.id, updateData);
            onSuccess();
            onClose();
        } catch (err) {
            setError('Failed to update service order. Please try again.');
            console.error('Error updating service order:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    if (!isOpen || !serviceOrder) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Edit Service Order - {serviceOrder.companyName}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                id="customerName"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Appointment Date *
                            </label>
                            <input
                                type="datetime-local"
                                id="appointmentDate"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {SERVICE_ORDER_STATUSES.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Materials ({materials.length})
                        </h3>
                        <div className="space-y-4">
                            {materials.map((material) => (
                                <div key={material.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{material.description}</h4>
                                            <p className="text-sm text-gray-600 mt-1">Product: {material.product}</p>
                                            {material.isHazardous !== null && (
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                                                    material.isHazardous 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {material.isHazardous ? '⚠️ Hazardous' : '✅ Non-Hazardous'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor={`notes-${material.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                            Internal Notes
                                        </label>
                                        <textarea
                                            id={`notes-${material.id}`}
                                            value={material.internalNotes || ''}
                                            onChange={(e) => handleMaterialNotesChange(material.id, e.target.value)}
                                            placeholder="Add notes about this material..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        />
                                    </div>

                                    {material.aiClassification && (
                                        <div className="mt-3 p-3 bg-white rounded border">
                                            <p className="text-sm text-gray-700">
                                                <strong>AI Analysis:</strong> {material.aiClassification}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                'Update Service Order'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
