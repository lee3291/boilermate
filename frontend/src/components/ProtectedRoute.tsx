import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // or a spinner component
  }

  if (!user || !token) {
    return <Navigate to='/signin' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
