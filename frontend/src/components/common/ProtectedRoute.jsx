import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, authenticated, loading, allowedRoles }) => {
    // If we're still loading authentication status, show a spinner
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // If not authenticated, redirect to login
    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified but user doesn't have the required role
    if (allowedRoles) {
        const userRole = localStorage.getItem('userRole');
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/app" replace />;
        }
    }

    // If authenticated and has the required role, render the protected content
    return children;
};

export default ProtectedRoute; 