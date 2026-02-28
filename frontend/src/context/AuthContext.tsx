import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface User {
    id: string;
    email?: string;
    username?: string;
    isGuest: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, username?: string) => Promise<void>;
    logout: () => void;
    continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        } else {
            const guestUser = sessionStorage.getItem('guestUser');
            if (guestUser) {
                setUser(JSON.parse(guestUser));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Login failed');
        }

        const { token, user: userData } = await response.json();
        const fullUser = { ...userData, isGuest: false };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(fullUser));
        sessionStorage.removeItem('guestUser');
        setUser(fullUser);
    };

    const signup = async (email: string, password: string, username?: string) => {
        const response = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Signup failed');
        }

        const { token, user: userData } = await response.json();
        const fullUser = { ...userData, isGuest: false };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(fullUser));
        sessionStorage.removeItem('guestUser');
        setUser(fullUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('guestUser');
        setUser(null);
    };

    const continueAsGuest = () => {
        const guestUser = {
            id: `guest-${uuidv4()}`,
            username: 'Guest',
            isGuest: true
        };
        sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
        setUser(guestUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, continueAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
