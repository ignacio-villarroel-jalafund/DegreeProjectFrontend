import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "./useAuth";
import {
  updateUserDetailsAPI,
  updateUserPasswordAPI,
  UserUpdateDetailsPayload,
  UserUpdatePasswordPayload,
} from "../services/api";

export type ProfileMode = "VIEW" | "EDIT_DETAILS" | "CHANGE_PASSWORD";

export const useProfilePage = () => {
  const { user, fetchUser } = useAuth();
  const [mode, setMode] = useState<ProfileMode>("VIEW");

  // State for editing details
  const [detailsForm, setDetailsForm] = useState({ username: "", email: "" });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSuccess, setDetailsSuccess] = useState<string | null>(null);

  // State for changing password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDetailsForm({ username: user.username, email: user.email });
    }
  }, [user]);

  const handleModeChange = (newMode: ProfileMode) => {
    setMode(newMode);
    // Reset messages and form states when changing mode
    setDetailsError(null);
    setDetailsSuccess(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    if (user && newMode === 'EDIT_DETAILS') {
        setDetailsForm({ username: user.username, email: user.email });
    }
    if (newMode === 'CHANGE_PASSWORD') {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsSuccess(null);

    const payload: UserUpdateDetailsPayload = {};
    if (detailsForm.username !== user.username) payload.username = detailsForm.username;
    if (detailsForm.email !== user.email) payload.email = detailsForm.email;

    if (Object.keys(payload).length === 0) {
      setDetailsError("No hay cambios para actualizar.");
      setDetailsLoading(false);
      return;
    }

    try {
      await updateUserDetailsAPI(payload);
      await fetchUser(); // Refresh user data globally
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
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      setPasswordLoading(false);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
      setPasswordLoading(false);
      return;
    }

    const payload: UserUpdatePasswordPayload = {
      current_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword,
      confirm_password: passwordForm.confirmPassword,
    };

    try {
      await updateUserPasswordAPI(payload);
      setPasswordSuccess("¡Contraseña actualizada con éxito!");
      setMode("VIEW");
    } catch (error: any) {
      setPasswordError(error.response?.data?.detail || "Error al actualizar la contraseña.");
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const hasDetailsChanged = user ? (detailsForm.username !== user.username || detailsForm.email !== user.email) : false;

  return {
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
  };
};