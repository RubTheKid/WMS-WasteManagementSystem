import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

   
    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">WMS</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Admin Portal
                                </h1>
                            </Link>
                        </div>

                        <nav className="flex space-x-4">
                            <Link
                                to="/admin/dashboard"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/admin/dashboard')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                📊 Dashboard
                            </Link>
                            <Link
                                to="/admin/create-order"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/admin/create-order')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                ➕ Create Order
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{user?.name}</span>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {user?.role}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            <p>🤖 AI-powered EPA RCRA hazardous waste classification</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>Admin Portal - Built with React + TypeScript + Vite</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
