import React from 'react';
import { ServiceOrderList } from './components/ServiceOrderList';

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-2 items-center flex flex-col justify-center align-center">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Manage service orders and monitor waste collection operations
                </p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <span className="text-2xl">📋</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <span className="text-2xl">⏳</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Hazardous</p>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
            </div>
            <ServiceOrderList />
        </div>
    );
};

export default Dashboard;
