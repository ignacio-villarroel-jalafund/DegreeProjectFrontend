import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ProfilePage: React.FC = () => <div>Mi Perfil (Protegido)</div>;
const CreateRecipePage: React.FC = () => <div>Crear Nueva Receta (Protegido)</div>;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ?
        <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return !isAuthenticated ?
        <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>

        <Route path="/" element={<HomePage />} />

        <Route
            path="/login"
            element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            }
        />
        <Route
            path="/register"
            element={
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            }
        />

        <Route
           path="/profile"
           element={
             <ProtectedRoute>
                <ProfilePage />
             </ProtectedRoute>
           }
         />
         <Route
           path="/recipes/new"
           element={
             <ProtectedRoute>
                <CreateRecipePage />
             </ProtectedRoute>
           }
         />
        <Route path="*" element={<div style={{ textAlign: 'center', padding: '2rem' }}><h2>404 - Página no encontrada</h2><p>La ruta que buscas no existe.</p></div>} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;