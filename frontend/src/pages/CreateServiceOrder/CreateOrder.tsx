import React from 'react';
import { CreateServiceOrderForm } from './components/CreateServiceOrderForm';

const CreateOrder: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Service Order</h1>
                <p className="text-gray-600 mt-1">
                    Create a new service order for waste management operations
                </p>
            </div>

            <CreateServiceOrderForm />
        </div>
    );
};

export default CreateOrder;