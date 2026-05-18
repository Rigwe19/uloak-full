import React, { createContext, useContext, useEffect, useState } from 'react';

interface MockUser {
    uid: string;
    email: string;
    displayName: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: MockUser | null;
    loading: boolean;
    isAdmin: boolean;
    login: (email: string, role: 'user' | 'admin') => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    login: () => {},
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<MockUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('uloak_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email: string, role: 'user' | 'admin') => {
        const newUser: MockUser = {
            uid: Math.random().toString(36).substring(7),
            email: email,
            displayName: email.split('@')[0],
            role: role,
        };
        setUser(newUser);
        localStorage.setItem('uloak_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('uloak_user');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
