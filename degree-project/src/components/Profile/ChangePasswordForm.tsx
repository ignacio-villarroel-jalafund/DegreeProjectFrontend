import React, { FormEvent } from 'react';
import styles from './ProfileForms.module.css';

interface ChangePasswordFormProps {
    formState: { currentPassword:string; newPassword: string; confirmPassword: string };
    setFormState: (form: { currentPassword:string; newPassword: string; confirmPassword: string }) => void;
    isLoading: boolean;
    error: string | null;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
    formState,
    setFormState,
    isLoading,
    error,
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
                    <label htmlFor="currentPassword" className={styles.formLabel}>Contraseña Actual:</label>
                    <input type="password" id="currentPassword" value={formState.currentPassword} onChange={handleChange} className={styles.formInput} required disabled={isLoading} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="newPassword" className={styles.formLabel}>Nueva Contraseña:</label>
                    <input type="password" id="newPassword" value={formState.newPassword} onChange={handleChange} className={styles.formInput} minLength={8} required disabled={isLoading} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.formLabel}>Confirmar Nueva Contraseña:</label>
                    <input type="password" id="confirmPassword" value={formState.confirmPassword} onChange={handleChange} className={styles.formInput} minLength={8} required disabled={isLoading} />
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.formActions}>
                    <button type="button" onClick={onCancel} className={`${styles.actionButton} ${styles.cancelButton}`} disabled={isLoading}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className={`${styles.actionButton} ${styles.saveButton}`}>
                        {isLoading ? "Confirmando..." : "Confirmar Cambio"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordForm;