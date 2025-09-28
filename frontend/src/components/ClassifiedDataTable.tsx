import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ClassifiedData {
    id: string;
    customer_name: string;
    company_name: string;
    appointment_date: string;
    contains_hazardous_material: boolean;
    classification_result: string;
    classification_confidence: number;
    material_count: number;
    material_descriptions: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

const ClassifiedDataTable: React.FC = () => {
    const { token } = useAuth();
    const [data, setData] = useState<ClassifiedData[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 100,
        total: 0,
        pages: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<string>('');

    const fetchData = async (page = 1, classificationFilter = '') => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString()
            });

            if (classificationFilter) {
                params.append('classification', classificationFilter);
            }

            const response = await fetch(`http://localhost:3001/api/v1/backfill/data?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch classified data');
            }

            const result = await response.json();
            setData(result.data.results);
            setPagination(result.data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, filter);
    }, [filter]);

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filter);
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.9) return 'text-green-600 bg-green-100';
        if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getHazardousBadge = (isHazardous: boolean) => {
        return isHazardous ? (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                ⚠️ Hazardous
            </span>
        ) : (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                ✅ Safe
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Classified Service Orders</h2>
                <div className="flex space-x-4">
                    <select
                        value={filter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Classifications</option>
                        <option value="hazardous">Hazardous Only</option>
                        <option value="non-hazardous">Non-Hazardous Only</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-700">{error}</div>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Appointment Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hazardous Material
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Classification
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Confidence
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Materials
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.customer_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.company_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(item.appointment_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getHazardousBadge(item.contains_hazardous_material)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.classification_result === 'hazardous'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {item.classification_result}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(item.classification_confidence)}`}>
                                                    {(item.classification_confidence * 100).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="max-w-xs truncate" title={item.material_descriptions}>
                                                    {item.material_descriptions || 'No materials'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {item.material_count} material(s)
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {data.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-gray-500">No classified data found</div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-2 text-sm font-medium text-gray-700">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassifiedDataTable;
