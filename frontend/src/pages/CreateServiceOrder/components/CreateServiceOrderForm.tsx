import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateServiceOrder, CreateMaterial } from '../../../types';
import { PRODUCT_TYPES } from '../../../types';
import { serviceOrderApi } from '../../../services/api';

interface CreateServiceOrderFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const CreateServiceOrderForm: React.FC<CreateServiceOrderFormProps> = ({
    onSuccess,
    onCancel,
}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<CreateServiceOrder>({
        customerName: '',
        companyName: '',
        appointmentDate: '',
        materials: [{ description: '', product: 'ELECTRONICS' }],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleInputChange = (field: keyof CreateServiceOrder, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMaterialChange = (index: number, field: keyof CreateMaterial, value: string) => {
        const updatedMaterials = formData.materials.map((material, i) =>
            i === index ? { ...material, [field]: value } : material
        );
        setFormData(prev => ({ ...prev, materials: updatedMaterials }));
    };

    const addMaterial = () => {
        setFormData(prev => ({
            ...prev,
            materials: [...prev.materials, { description: '', product: 'ELECTRONICS' }],
        }));
    };

    const removeMaterial = (index: number) => {
        if (formData.materials.length > 1) {
            setFormData(prev => ({
                ...prev,
                materials: prev.materials.filter((_, i) => i !== index),
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form
            if (!formData.customerName.trim()) {
                throw new Error('Customer name is required');
            }
            if (!formData.companyName.trim()) {
                throw new Error('Company name is required');
            }
            if (!formData.appointmentDate) {
                throw new Error('Appointment date is required');
            }
            if (formData.materials.some(m => !m.description.trim())) {
                throw new Error('All materials must have a description');
            }

            await serviceOrderApi.create(formData);

            //reset form
            setFormData({
                customerName: '',
                companyName: '',
                appointmentDate: '',
                materials: [{ description: '', product: 'ELECTRONICS' }],
            });

            setShowSuccessModal(true);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Failed to create service order');
            console.error('Error creating service order:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleModalOk = () => {
        setShowSuccessModal(false);
        navigate('/');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Service Order</h2>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Name *
                        </label>
                        <input
                            type="text"
                            id="customerName"
                            value={formData.customerName}
                            onChange={(e) => handleInputChange('customerName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter customer name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter company name"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        id="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-md"
                        min={getMinDateTime()}
                        required
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Materials to Collect *
                        </label>
                        <button
                            type="button"
                            onClick={addMaterial}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                        >
                            + Add Material
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.materials.map((material, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-gray-900">Material {index + 1}</h4>
                                    {formData.materials.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMaterial(index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={material.description}
                                            onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                                            placeholder="Describe the waste material in detail..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product Type *
                                        </label>
                                        <select
                                            value={material.product}
                                            onChange={(e) => handleMaterialChange(index, 'product', e.target.value as any)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            {PRODUCT_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </span>
                        ) : (
                            'Create Service Order'
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">AI Analysis</h4>
                <p className="text-sm text-blue-700">
                    After creating the service order, our AI will automatically analyze each material
                    according to EPA RCRA standards to determine hazard classifications (D001-D043, F/K/P/U-listed).
                </p>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Order Created Successfully!</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Your request has been received and will be processed. Our AI will analyze the materials according to EPA RCRA standards.
                            </p>
                            <button
                                onClick={handleModalOk}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateServiceOrderForm;