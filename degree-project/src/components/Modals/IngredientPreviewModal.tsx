import React, { useRef } from 'react';
import styles from '../../pages/RecipeDisplayPage.module.css';
import { IngredientPreviewState } from '../../hooks/useIngredientInteraction';
import LoadingSpinner from '../UI/LoadingSpinner';

interface IngredientPreviewModalProps {
  previewState: IngredientPreviewState;
  isLoading: boolean;
  onClose: () => void;
}

const IngredientPreviewModal: React.FC<IngredientPreviewModalProps> = ({ previewState, isLoading, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!previewState) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div className={styles.ingredientPreviewModalOverlay} onClick={handleOverlayClick}>
      <div ref={modalRef} className={styles.ingredientPreviewModal}>
        <h3>{previewState.name}</h3>
        
        {isLoading ? (
            <LoadingSpinner />
        ) : (
            <>
                {previewState.found && previewState.imageUrl && (
                    <img src={previewState.imageUrl} alt={previewState.name} className={styles.ingredientPreviewImage} />
                )}
                {!previewState.found && previewState.message && (
                    <p className={styles.noImagePreview}>{previewState.message}</p>
                )}
                {previewState.found && !previewState.imageUrl && (
                    <p className={styles.noImagePreview}>No hay imagen disponible.</p>
                )}

                {previewState.found && previewState.searchUrl && (
                    <a href={previewState.searchUrl} target="_blank" rel="noopener noreferrer" className={`${styles.previewLinkButton} ${styles.modalButton}`}>
                        Ver más información
                    </a>
                )}
            </>
        )}
        
        <button onClick={onClose} className={`${styles.previewCloseButton} ${styles.modalButton}`}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default IngredientPreviewModal;