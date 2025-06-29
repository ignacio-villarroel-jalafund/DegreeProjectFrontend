import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProfilePage } from "../hooks/useProfilePage";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ProfileView from "../components/Profile/ProfileView";
import EditDetailsForm from "../components/Profile/EditDetailsForm";
import ChangePasswordForm from "../components/Profile/ChangePasswordForm";
import styles from "./ProfilePage.module.css";

const ProfilePage: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    user,
    mode,
    handleModeChange,
    detailsForm,
    setDetailsForm,
    detailsLoading,
    detailsError,
    detailsSuccess,
    handleDetailsSubmit,
    hasDetailsChanged,
    passwordForm,
    setPasswordForm,
    passwordLoading,
    passwordError,
    passwordSuccess,
    handlePasswordSubmit,
  } = useProfilePage();

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user) {
    return <div className={styles.noUser}>No se pudo cargar la información del usuario.</div>
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileHeader}>Mi Perfil</h1>

      {detailsSuccess && mode === 'VIEW' && <p className={styles.successMessage}>{detailsSuccess}</p>}
      {passwordSuccess && mode === 'VIEW' && <p className={styles.successMessage}>{passwordSuccess}</p>}

      {mode === 'VIEW' && <ProfileView user={user} />}
      
      {mode === 'EDIT_DETAILS' && (
        <EditDetailsForm
          formState={detailsForm}
          setFormState={setDetailsForm}
          isLoading={detailsLoading}
          error={detailsError}
          hasChanged={hasDetailsChanged}
          onSubmit={handleDetailsSubmit}
          onCancel={() => handleModeChange('VIEW')}
        />
      )}

      {mode === 'CHANGE_PASSWORD' && (
        <ChangePasswordForm 
            formState={passwordForm}
            setFormState={setPasswordForm}
            isLoading={passwordLoading}
            error={passwordError}
            onSubmit={handlePasswordSubmit}
            onCancel={() => handleModeChange('VIEW')}
        />
      )}

      {mode === 'VIEW' && (
        <div className={styles.profileActions}>
          <button onClick={() => handleModeChange('EDIT_DETAILS')} className={`${styles.actionButton} ${styles.editButton}`}>
            Editar Perfil
          </button>
          <button onClick={() => handleModeChange('CHANGE_PASSWORD')} className={`${styles.actionButton} ${styles.passwordButton}`}>
            Cambiar Contraseña
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;