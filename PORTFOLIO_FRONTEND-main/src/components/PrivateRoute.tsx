import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

interface PrivateRouteProps {
  /** The protected page element to render when authenticated. */
  element: React.ReactElement;
}

/**
 * Guards a route behind authentication.
 * Redirects to /login if the user is not authenticated,
 * and shows a loading state while the auth check is in progress.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
