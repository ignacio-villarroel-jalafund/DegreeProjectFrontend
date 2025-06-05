import React, { useState, useEffect, FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./ProfilePage.module.css";
import { updateUserDetailsAPI, updateUserPasswordAPI, UserUpdateDetailsPayload, UserUpdatePasswordPayload } from "../services/api";

type ProfileMode = "VIEW" | "EDIT_DETAILS" | "CHANGE_PASSWORD";

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, fetchUser } = useAuth();

  const [mode, setMode] = useState<ProfileMode>("VIEW");

  const [currentUsername, setCurrentUsername] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSuccess, setDetailsSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPasswordState] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentUsername(user.username || "");
      setCurrentEmail(user.email || "");
    }
  }, [user]);

  const resetDetailsFormMessages = () => {
    setDetailsError(null);
    setDetailsSuccess(null);
  };

  const resetPasswordFormMessagesAndFields = () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setCurrentPasswordState("");
    setNewPasswordValue("");
    setConfirmPassword("");
  };

  const handleEditDetailsClick = () => {
    setMode("EDIT_DETAILS");
    resetDetailsFormMessages();
    if (user) {
        setCurrentUsername(user.username);
        setCurrentEmail(user.email);
    }
  };

  const handleChangePasswordClick = () => {
    setMode("CHANGE_PASSWORD");
    resetPasswordFormMessagesAndFields();
  };

  const handleCancel = () => {
    setMode("VIEW");
    resetDetailsFormMessages();
    resetPasswordFormMessagesAndFields();
    if (user) {
      setCurrentUsername(user.username);
      setCurrentEmail(user.email);
    }
  };

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setDetailsLoading(true);
    resetDetailsFormMessages();

    const payload: UserUpdateDetailsPayload = {};
    if (currentUsername !== user.username) {
      payload.username = currentUsername;
    }
    if (currentEmail !== user.email) {
      payload.email = currentEmail;
    }

    if (Object.keys(payload).length === 0) {
      setDetailsError("No hay cambios para actualizar.");
      setDetailsLoading(false);
      return;
    }

    try {
      await updateUserDetailsAPI(payload);
      await fetchUser();
      setDetailsSuccess("¡Perfil actualizado con éxito!");
      setMode("VIEW");
    } catch (error: any) {
      setDetailsError(error.response?.data?.detail || "Error al actualizar el perfil.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    resetPasswordFormMessagesAndFields();

    if (newPasswordValue !== confirmPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      setPasswordLoading(false);
      return;
    }
    if (newPasswordValue.length < 8) {
        setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
        setPasswordLoading(false);
        return;
    }


    const payload: UserUpdatePasswordPayload = {
      current_password: currentPassword,
      new_password: newPasswordValue,
      confirm_password: confirmPassword,
    };

    try {
      await updateUserPasswordAPI(payload);
      setPasswordSuccess("¡Contraseña actualizada con éxito!");
      setMode("VIEW");
      resetPasswordFormMessagesAndFields();
    } catch (error: any) {
      setPasswordError(error.response?.data?.detail || "Error al actualizar la contraseña.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateInput: Date | string | undefined): string => {
    if (!dateInput) return "No disponible";
    try {
      const dateObj = new Date(dateInput);
      if (isNaN(dateObj.getTime())) {
        return typeof dateInput === 'string' ? dateInput : "Fecha inválida";
      }
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return typeof dateInput === 'string' ? dateInput : "Error al formatear fecha";
    }
  };

  const hasDetailsChanged = user ? (currentUsername !== user.username || currentEmail !== user.email) : false;

  if (isLoading && !user) {
    return <div className={styles.loading}>Cargando perfil...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className={styles.noUser}>
        No se pudo cargar la información del usuario.
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileHeader}>Mi Perfil</h1>

      {mode === "VIEW" && (
        <div className={styles.profileDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Nombre de Usuario:</span>
            <span className={styles.detailValue}>{user.username}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Correo Electrónico:</span>
            <span className={styles.detailValue}>{user.email}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Usuario desde:</span>
            <span className={styles.detailValue}>{formatDate(user.created_at)}</span>
          </div>
        </div>
      )}

      {detailsSuccess && mode === "VIEW" && <p className={styles.successMessage}>{detailsSuccess}</p>}
      {passwordSuccess && mode === "VIEW" && <p className={styles.successMessage}>{passwordSuccess}</p>}


      {mode === "EDIT_DETAILS" && (
        <div className={styles.formSection}>
          <form onSubmit={handleDetailsSubmit} className={styles.profileForm}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>Nombre de Usuario:</label>
              <input
                type="text"
                id="username"
                value={currentUsername}
                onChange={(e) => setCurrentUsername(e.target.value)}
                className={styles.formInput}
                disabled={detailsLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Correo Electrónico:</label>
              <input
                type="email"
                id="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                className={styles.formInput}
                disabled={detailsLoading}
              />
            </div>
            {detailsError && <p className={styles.errorMessage}>{detailsError}</p>}
            <div className={styles.formActions}>
              <button type="button" onClick={handleCancel} className={`${styles.actionButton} ${styles.cancelButton}`} disabled={detailsLoading}>
                Cancelar
              </button>
              <button type="submit" disabled={detailsLoading || !hasDetailsChanged} className={`${styles.actionButton} ${styles.saveButton}`}>
                {detailsLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === "CHANGE_PASSWORD" && (
        <div className={styles.formSection}>
          <form onSubmit={handlePasswordSubmit} className={styles.profileForm}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.formLabel}>Contraseña Actual:</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPasswordState(e.target.value)}
                className={styles.formInput}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.formLabel}>Nueva Contraseña:</label>
              <input
                type="password"
                id="newPassword"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                className={styles.formInput}
                minLength={8}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>Confirmar Nueva Contraseña:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.formInput}
                minLength={8}
                required
                disabled={passwordLoading}
              />
            </div>
            {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
            <div className={styles.formActions}>
              <button type="button" onClick={handleCancel} className={`${styles.actionButton} ${styles.cancelButton}`} disabled={passwordLoading}>
                Cancelar
              </button>
              <button type="submit" disabled={passwordLoading} className={`${styles.actionButton} ${styles.saveButton}`}>
                {passwordLoading ? "Confirmando..." : "Confirmar Cambio"}
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === "VIEW" && (
        <div className={styles.profileActions}>
          <button onClick={handleEditDetailsClick} className={`${styles.actionButton} ${styles.editButton}`}>
            Editar Perfil
          </button>
          <button onClick={handleChangePasswordClick} className={`${styles.actionButton} ${styles.passwordButton}`}>
            Cambiar Contraseña
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
