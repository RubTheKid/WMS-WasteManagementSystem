import axios, { type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import type { ServiceOrdersResponse, CreateServiceOrder, ServiceOrder } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('wms_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
//interceptor to handle expired token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('wms_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const serviceOrderApi = {
    getAll: async (params?: { status?: string }): Promise<ServiceOrdersResponse> => {
        const response: AxiosResponse<ServiceOrdersResponse> = await api.get('/api/v1/service-orders', { params });
        return response.data;
    },

    create: async (data: CreateServiceOrder): Promise<ServiceOrder> => {
        const response: AxiosResponse<ServiceOrder> = await api.post('/api/v1/service-orders', data);
        return response.data;
    },

    update: async (id: string, data: {
        customerName: string;
        companyName: string;
        appointmentDate: string;
        status?: string;
        materials?: Array<{
            id: string;
            internalNotes?: string;
        }>;
    }): Promise<ServiceOrder> => {
        const response: AxiosResponse<ServiceOrder> = await api.put(`/api/v1/service-orders/${id}`, data);
        return response.data;
    },
};


export default api;
