// PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../components/context/AuthContext';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
