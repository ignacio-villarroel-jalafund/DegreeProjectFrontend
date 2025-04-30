import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient, AuthToken } from '../services/api';
import styles from './FormPage.module.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isOnline } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isOnline) {
      setError('Estás offline. Necesitas conexión para iniciar sesión.');
      return;
    }

    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await apiClient.post<AuthToken>(
        '/users/token',
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      await login(response.data.access_token);
      navigate('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Login failed:', err);
        if (!navigator.onLine) {
             setError('Login falló. Parece que estás offline.');
        } else if (err.response && err.response.data && err.response.data.detail) {
            setError(err.response.data.detail);
        } else {
             setError('Error al iniciar sesión. Verifica tus credenciales.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className={styles.errorMessage}>{error}</p>}
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
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading || !isOnline} className={styles.submitButton}>
          {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
        {!isOnline && <p style={{ color: 'orange', textAlign: 'center', marginTop: '1em' }}>Necesitas conexión para iniciar sesión.</p>}
      </form>
      <p className={styles.switchForm}>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default LoginPage;