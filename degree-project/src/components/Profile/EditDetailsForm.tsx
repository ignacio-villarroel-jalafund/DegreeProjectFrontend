import React, { FormEvent } from 'react';
import styles from './ProfileForms.module.css';

interface EditDetailsFormProps {
  formState: { username: string; email: string };
  setFormState: (form: { username: string; email: string }) => void;
  isLoading: boolean;
  error: string | null;
  hasChanged: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

const EditDetailsForm: React.FC<EditDetailsFormProps> = ({
  formState,
  setFormState,
  isLoading,
  error,
  hasChanged,
  onSubmit,
  onCancel,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState({ ...formState, [id]: value });
  };

  return (
    <div className={styles.formSection}>
      <form onSubmit={onSubmit} className={styles.profileForm}>
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.formLabel}>Nombre de Usuario:</label>
          <input
            type="text"
            id="username"
            value={formState.username}
            onChange={handleChange}
            className={styles.formInput}
            disabled={isLoading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={formState.email}
            onChange={handleChange}
            className={styles.formInput}
            disabled={isLoading}
          />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={`${styles.actionButton} ${styles.cancelButton}`} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" disabled={isLoading || !hasChanged} className={`${styles.actionButton} ${styles.saveButton}`}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDetailsForm;