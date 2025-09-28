import React from 'react';
import { Link } from 'react-router-dom';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
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
                                    Waste Management
                                </h1>
                            </Link>
                        </div>

                        <nav className="flex space-x-4">
                            <Link
                                to="/admin/create-order"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Schedule Collection
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                Admin Login
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main>
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">WMS</span>
                                </div>
                                <span className="font-bold text-gray-900">Waste Management</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Professional waste management services with AI-powered EPA RCRA compliance.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>Hazardous Waste Collection</li>
                                <li>EPA RCRA Classification</li>
                                <li>Safe Transportation</li>
                                <li>Proper Disposal</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>Phone: (555) 123-4567</li>
                                <li>Email: info@wastemanagement.com</li>
                                <li>Hours: Mon-Fri 8AM-6PM</li>
                                <li>Emergency: 24/7 Support</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Compliance</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>EPA RCRA Certified</li>
                                <li>DOT Licensed</li>
                                <li>State Permitted</li>
                                <li>Fully Insured</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-8">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                © 2025 Waste Management System. All rights reserved.
                            </p>
                            <div className="flex space-x-4 text-sm text-gray-500">
                                <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                                <a href="#" className="hover:text-gray-900">Terms of Service</a>
                                <a href="#" className="hover:text-gray-900">Contact</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};