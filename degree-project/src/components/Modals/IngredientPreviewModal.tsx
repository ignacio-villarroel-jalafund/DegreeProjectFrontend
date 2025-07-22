import React, { useRef } from 'react';
import styles from '../../pages/RecipeDisplayPage.module.css';
import { IngredientPreviewState } from '../../hooks/useIngredientInteraction';
import LoadingSpinner from '../UI/LoadingSpinner';
import { useConfirmation } from '../../hooks/useConfirmation';

interface IngredientPreviewModalProps {
  previewState: IngredientPreviewState;
  isLoading: boolean;
  onClose: () => void;
}

const IngredientPreviewModal: React.FC<IngredientPreviewModalProps> = ({ previewState, isLoading, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { showConfirmation } = useConfirmation();

  if (!previewState) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (previewState.searchUrl) {
      showConfirmation(previewState.searchUrl, `Estás a punto de buscar "${previewState.name}" en la web. ¿Deseas continuar?`);
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
                    <button onClick={handleLinkClick} className={`${styles.previewLinkButton} ${styles.modalButton}`}>
                        Ver más información
                    </button>
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
