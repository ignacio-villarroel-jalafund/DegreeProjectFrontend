import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FormPage.module.css';
import { useAuthForm } from '../hooks/useAuthForm';
import PasswordInput from '../components/UI/PasswordInput';

const LoginPage: React.FC = () => {
  const {
    fields,
    error,
    isLoading,
    isOnline,
    handleChange,
    handleSubmit,
  } = useAuthForm('login');

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
            value={fields.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={styles.formInput}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Contraseña:</label>
          <PasswordInput
            id="password"
            value={fields.password || ''}
            onChange={handleChange}
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
