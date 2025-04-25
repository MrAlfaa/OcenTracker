import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const InitialRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // If user is already authenticated, go to home page
      // Otherwise, redirect to login page
      navigate(isAuthenticated ? '/' : '/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading spinner while checking authentication status
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default InitialRedirect;