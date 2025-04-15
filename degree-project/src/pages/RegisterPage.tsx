import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient, type User } from '../services/api';
import styles from './FormPage.module.css';
import { useAuth } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline } = useAuth();
  const navigate = useNavigate();

  const registerBackgroundSync = async () => {
      try {
          const registration = await navigator.serviceWorker.ready;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (registration as any).sync.register('sync-registrations');
          console.log('Background sync registered for registration');
          setInfo('Estás offline. Tu registro se completará cuando vuelvas a tener conexión.');
          setError(null);
      } catch (err) {
          console.error('Background sync registration failed:', err);
          setError('No se pudo registrar la tarea de sincronización. Inténtalo cuando tengas conexión.');
          setInfo(null);
      }
  };

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

    setIsLoading(true);

    try {
      console.log('Attempting registration...');
      await apiClient.post<User>(
        '/users',
        { email, password }
      );
      console.log('Registration successful online.');
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Registration failed:', err);
      if (!isOnline || (err.message && err.message.toLowerCase().includes('network error'))) {
          console.log('Registration failed due to offline status. Attempting background sync.');
          await registerBackgroundSync();

      } else if (err.response && err.response.data && err.response.data.detail) {
         if (err.response.status === 400 && typeof err.response.data.detail === 'string' && err.response.data.detail.includes("registrado")) {
              setError('Este correo electrónico ya está registrado.');
         } else if (err.response.status === 422) {
              let validationErrors = 'Error de validación. ';
              if (Array.isArray(err.response.data.detail)) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  validationErrors += err.response.data.detail.map((e: any) => `${e.loc[e.loc.length-1]}: ${e.msg}`).join('; ');
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