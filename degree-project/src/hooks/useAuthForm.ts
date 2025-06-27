import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, AuthToken, User } from '../services/api';
import { useAuth } from './useAuth';

type FormType = 'login' | 'register';

interface FormFields {
  username?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export const useAuthForm = (type: FormType) => {
  const [fields, setFields] = useState<FormFields>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isOnline } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({
      ...fields,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isOnline) {
      setError('Estás offline. Se necesita conexión a internet.');
      return;
    }

    // Validaciones para el registro
    if (type === 'register') {
      if (fields.password !== fields.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if ((fields.password?.length ?? 0) < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (!fields.username?.trim()) {
        setError('El nombre de usuario es requerido.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (type === 'login') {
        const formData = new URLSearchParams();
        formData.append('username', fields.email); // El API espera 'username' para el email en el login
        formData.append('password', fields.password || '');
        
        const response = await apiClient.post<AuthToken>(
          '/users/token',
          formData,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        await login(response.data.access_token);
        navigate('/');
      } else { // 'register'
        await apiClient.post<User>('/users', {
          username: fields.username,
          email: fields.email,
          password: fields.password,
        });
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        navigate('/login');
      }
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (err: any) => {
    if (!isOnline || (err.message && err.message.toLowerCase().includes('network error'))) {
        setError('Error de red. Por favor, verifica tu conexión e intenta de nuevo.');
    } else if (err.response && err.response.data && err.response.data.detail) {
       if (err.response.status === 400) {
          const detail = err.response.data.detail.toLowerCase();
          if (typeof detail === 'string') {
              if (detail.includes("email already registered")) {
                  setError('Este correo electrónico ya está registrado.');
              } else if (detail.includes("username already registered")) {
                  setError('Este nombre de usuario ya está registrado.');
              } else if (detail.includes('incorrect username or password')){
                  setError('Correo electrónico o contraseña incorrectos.');
              } else {
                  setError(err.response.data.detail);
              }
          } else {
               setError('Error en los datos enviados.');
          }
       } else if (err.response.status === 422) {
            let validationErrors = 'Error de validación. ';
            if (Array.isArray(err.response.data.detail)) {
                validationErrors += err.response.data.detail.map((e: any) => {
                    const field = e.loc && e.loc.length > 1 ? e.loc[1] : 'campo';
                    return `${field}: ${e.msg}`;
                }).join('; ');
            } else {
                validationErrors += 'Verifica los datos ingresados.';
            }
            setError(validationErrors);
       } else {
           setError(err.response.data.detail || `Error al ${type === 'login' ? 'iniciar sesión' : 'registrar el usuario'}.`);
       }
    } else {
      setError(`Error desconocido al ${type === 'login' ? 'iniciar sesión' : 'registrar el usuario'}.`);
    }
  };


  return {
    fields,
    error,
    isLoading,
    isOnline,
    handleChange,
    handleSubmit,
  };
};