import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./ProfilePage.module.css";

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className={styles.loading}>Cargando perfil...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className={styles.noUser}>
        No se pudo cargar la información del usuario. Intenta recargar o iniciar
        sesión nuevamente.
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileHeader}>Mi Perfil</h1>
      <div className={styles.profileDetails}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>ID de Usuario:</span>
          <span className={styles.detailValue}>
            {user.id || "No disponible"}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Correo Electrónico:</span>
          <span className={styles.detailValue}>{user.email}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Usuario desde:</span>
          <span className={styles.detailValue}>{user.created_at}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
