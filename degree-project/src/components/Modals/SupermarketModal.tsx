import React, { useRef, useCallback } from 'react';
import styles from '../../pages/RecipeDisplayPage.module.css';
import { SupermarketModalState } from '../../hooks/useIngredientInteraction';
import LoadingSpinner from '../UI/LoadingSpinner';

interface SupermarketModalProps {
  modalState: SupermarketModalState;
  onClose: () => void;
  onLoadMore: () => void;
}

const SupermarketModal: React.FC<SupermarketModalProps> = ({ modalState, onClose, onLoadMore }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>(null);

  const lastSupermarketElementRef = useCallback((node: HTMLLIElement | null) => {
    if (modalState.isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && modalState.nextPageToken) {
        onLoadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [modalState.isLoading, modalState.nextPageToken, onLoadMore]);

  if (!modalState.isOpen) return null;

  return (
    <div className={styles.supermarketModalOverlay} onClick={onClose}>
      <div ref={modalRef} className={styles.supermarketModal} onClick={(e) => e.stopPropagation()}>
        <h3>Supermercados en tu Área</h3>
        {modalState.isLoading && !modalState.results?.length ? (
          <LoadingSpinner />
        ) : modalState.error && !modalState.results?.length ? (
          <p className={styles.error}>{modalState.error}</p>
        ) : modalState.results && modalState.results.length > 0 ? (
          <ul className={styles.supermarketList}>
            {modalState.results.map((supermarket, index) => (
              <li
                ref={modalState.results!.length === index + 1 ? lastSupermarketElementRef : null}
                key={supermarket.place_id + "-" + index}
                className={styles.supermarketListItem}
              >
                <div className={styles.supermarketHeader}><strong>{supermarket.name}</strong></div>
                <p className={styles.supermarketAddress}>{supermarket.address}</p>
                {/* Add more details as needed */}
              </li>
            ))}
            {modalState.isLoading && <li className={styles.loadingMoreListItem}><LoadingSpinner /></li>}
          </ul>
        ) : (
          <p>No se encontraron supermercados.</p>
        )}
        <button onClick={onClose} className={`${styles.modalButton} ${styles.closeModalButton}`}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default SupermarketModal;