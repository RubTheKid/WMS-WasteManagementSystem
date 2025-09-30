import React from 'react';
import type { Material } from '../../../types';
import { getHazardBadgeClass, getClassificationBadgeClass } from '../../../utils/helpers';

interface MaterialCardProps {
    material: Material;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
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

export default MaterialCard;


