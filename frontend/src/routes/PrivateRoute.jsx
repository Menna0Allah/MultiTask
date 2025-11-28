import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

const PrivateRoute = ({ children, requireClient, requireFreelancer }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check user type requirements
  if (requireClient && !user?.is_client) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireFreelancer && !user?.is_freelancer) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;