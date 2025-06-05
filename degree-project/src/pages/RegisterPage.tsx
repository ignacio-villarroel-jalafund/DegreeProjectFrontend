import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient, User } from '../services/api';
import styles from './FormPage.module.css';
import { useAuth } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!username.trim()) {
      setError('El nombre de usuario es requerido.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post<User>(
        '/users',
        { username, email, password }
      );
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login');

    } catch (err: any) {
      if (!isOnline || (err.message && err.message.toLowerCase().includes('network error'))) {
          setError('Error de red. Por favor, verifica tu conexión e intenta de nuevo.');
      } else if (err.response && err.response.data && err.response.data.detail) {
         if (err.response.status === 400) {
            if (typeof err.response.data.detail === 'string') {
                if (err.response.data.detail.toLowerCase().includes("email already registered")) {
                    setError('Este correo electrónico ya está registrado.');
                } else if (err.response.data.detail.toLowerCase().includes("username already registered")) {
                    setError('Este nombre de usuario ya está registrado.');
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
         }
          else {
             setError(err.response.data.detail || 'Error al registrar el usuario.');
          }
       }
      else {
        setError('Error desconocido al registrar el usuario.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {info && <p className={styles.infoMessage}>{info}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="username">Nombre de Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
         <div className={styles.formGroup}>
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Contraseña (mín. 8 caracteres):</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>
       <p className={styles.switchForm}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
