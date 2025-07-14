import React from 'react';
import { Link } from 'react-router-dom';
import styles from './FormPage.module.css';
import { useAuthForm } from '../hooks/useAuthForm';
import PasswordInput from '../components/UI/PasswordInput';

const RegisterPage: React.FC = () => {
  const {
    fields,
    error,
    isLoading,
    handleChange,
    handleSubmit,
  } = useAuthForm('register');

  return (
    <div className={styles.formContainer}>
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <div className={styles.formGroup}>
          <label htmlFor="username">Nombre de Usuario:</label>
          <input
            type="text"
            id="username"
            value={fields.username || ''}
            onChange={handleChange}
            required
            disabled={isLoading}
            className={styles.formInput}
          />
        </div>
        
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
          <label htmlFor="password">Contraseña (mín. 8 caracteres):</label>
          <PasswordInput
            id="password"
            value={fields.password || ''}
            onChange={handleChange}
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <PasswordInput
            id="confirmPassword"
            value={fields.confirmPassword || ''}
            onChange={handleChange}
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
