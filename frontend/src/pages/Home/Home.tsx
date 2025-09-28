import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="space-y-16">
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Professional Waste Management
                        <span className="block text-blue-600">With AI-Powered EPA Compliance</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Schedule safe, compliant waste collection services. Our AI system automatically
                        classifies materials according to EPA RCRA standards, ensuring proper handling
                        of hazardous materials.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/admin/create-order"
                            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Schedule Collection Now
                        </Link>
                        <Link
                            to="#how-it-works"
                            className="px-8 py-4 border border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-not-allowed disabled opacity-50"
                        >
                            How It Works
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Service?</h2>
                        <p className="text-lg text-gray-600">
                            Advanced technology meets professional waste management expertise
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🤖</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
                            <p className="text-gray-600">
                                Our advanced AI system automatically classifies waste materials according to
                                EPA RCRA standards (D001-D043, F/K/P/U-listed) for precise compliance.
                            </p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🏆</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">EPA Certified</h3>
                            <p className="text-gray-600">
                                Fully licensed and certified waste management professionals ensure
                                compliance with all federal and state environmental regulations.
                            </p>
                        </div>

                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast & Reliable</h3>
                            <p className="text-gray-600">
                                Quick online scheduling, prompt service, and real-time tracking
                                of your waste collection and disposal process.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600">
                            Simple, safe, and compliant waste management in 4 easy steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                1
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Online</h3>
                            <p className="text-gray-600 text-sm">
                                Fill out our simple form with your contact information and appointment preferences.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                2
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Describe Materials</h3>
                            <p className="text-gray-600 text-sm">
                                Provide detailed descriptions of waste materials for accurate AI classification.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                3
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
                            <p className="text-gray-600 text-sm">
                                Our AI system analyzes materials for EPA RCRA compliance and hazard classification.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                                4
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Collection</h3>
                            <p className="text-gray-600 text-sm">
                                Certified team arrives with proper equipment for safe collection and disposal.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">EPA RCRA Classifications</h2>
                        <p className="text-lg text-gray-600">
                            Our AI system identifies and classifies hazardous materials according to EPA standards
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                            <div className="flex items-center mb-3">
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-mono font-bold">D001</span>
                                <h3 className="ml-3 font-semibold text-gray-900">Ignitable</h3>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Materials that can easily catch fire (flash point &lt;140°F, oxidizers, etc.)
                            </p>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-center mb-3">
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono font-bold">D002</span>
                                <h3 className="ml-3 font-semibold text-gray-900">Corrosive</h3>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Materials that corrode containers or cause skin/eye damage (pH ≤2 or ≥12.5)
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <div className="flex items-center mb-3">
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-mono font-bold">D003</span>
                                <h3 className="ml-3 font-semibold text-gray-900">Reactive</h3>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Unstable materials that may explode or release toxic fumes when exposed
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-center mb-3">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-mono font-bold">D004+</span>
                                <h3 className="ml-3 font-semibold text-gray-900">Toxic</h3>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Materials containing toxins above regulatory levels (D004-D043)
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-blue-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Schedule Your Waste Collection?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Get started with our AI-powered, EPA-compliant waste management service today.
                    </p>
                    <Link
                        to="/admin/create-order"
                        className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Schedule Collection Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
