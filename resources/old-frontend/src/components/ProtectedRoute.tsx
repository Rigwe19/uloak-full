import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const AdminRoute: React.FC = () => {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-dark">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-gold border-t-transparent"></div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export const PrivateRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-dark">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-gold border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
