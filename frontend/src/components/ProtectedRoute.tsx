import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // or a spinner component
  }

  if (!user || !token) {
    // If the user is not authenticated, redirect them to the sign-in page.
    // We store the current location they were trying to access in the `redirect`
    // query parameter. This allows us to send them back to their original
    // destination after they successfully log in.
    return (
      <Navigate
        to={`/signin?redirect=${location.pathname}${location.search}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
