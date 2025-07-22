import React from 'react';
import { useConfirmation } from '../../hooks/useConfirmation';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal: React.FC = () => {
  const { confirmationState, hideConfirmation, proceed } = useConfirmation();

  if (!confirmationState.isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={hideConfirmation}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Confirmación Requerida</h3>
        <p className={styles.message}>{confirmationState.message}</p>
        <div className={styles.actions}>
          <button onClick={hideConfirmation} className={`${styles.button} ${styles.cancelButton}`}>
            Cancelar
          </button>
          <button onClick={proceed} className={`${styles.button} ${styles.confirmButton}`}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
