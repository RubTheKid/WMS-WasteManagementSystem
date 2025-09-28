import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'EMPLOYEE';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const savedToken = Cookies.get('wms_token');

            if (savedToken) {
                try {
                    // send request to backend to verify if token is valid
                    const response = await api.get('/api/auth/verify');
                    if (response.data.success) {
                        setToken(savedToken);
                        setUser(response.data.data.user);
                    } else {
                        Cookies.remove('wms_token');
                    }
                } catch (error) {
                    Cookies.remove('wms_token');
                    console.error('Token verification failed:', error);
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        try {
            const response = await api.post('/api/auth/login', { email, password });

            if (response.data.success) {
                const { token: newToken } = response.data.data;

                Cookies.set('wms_token', newToken, { expires: 1 });

                setToken(newToken);
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Login failed. Please check your credentials.');
        }
    };

    const logout = () => {
        Cookies.remove('wms_token');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token && !!user;

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
