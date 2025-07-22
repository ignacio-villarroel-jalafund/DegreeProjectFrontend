import React, { useRef, useCallback } from 'react';
import styles from '../../pages/RecipeDisplayPage.module.css';
import { SupermarketModalState } from '../../hooks/useIngredientInteraction';
import LoadingSpinner from '../UI/LoadingSpinner';
import { useConfirmation } from '../../hooks/useConfirmation';

interface SupermarketModalProps {
  modalState: SupermarketModalState;
  onClose: () => void;
  onLoadMore: () => void;
}

const SupermarketModal: React.FC<SupermarketModalProps> = ({ modalState, onClose, onLoadMore }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>(null);
  const { showConfirmation } = useConfirmation();

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

  const handleLinkClick = (e: React.MouseEvent<HTMLButtonElement>, url: string, name: string) => {
    e.preventDefault();
    const message = e.currentTarget.textContent?.toLowerCase().includes('mapa')
      ? `Se abrirá Google Maps para mostrar la ubicación de "${name}". ¿Continuar?`
      : `Estás por visitar el sitio web de "${name}". ¿Continuar?`;
    showConfirmation(url, message);
  };

  const renderOpeningHours = (hours: string[] | undefined | null) => {
    if (!hours || hours.length === 0) {
      return <p className={styles.supermarketDetail}>Horarios no disponibles.</p>;
    }

    return (
      <div className={styles.supermarketDetail}>
        <strong>Horarios de atención:</strong>
        <ul className={styles.hoursList}>
          {hours.map((line, index) => {
            const parts = line.split(':');
            const day = parts[0];
            const time = parts.slice(1).join(':');
            return (
              <li key={index} className={styles.hoursListItem}>
                <span className={styles.hoursDay}>{day}:</span>
                <span className={styles.hoursTime}>{time}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

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
                <p className={styles.supermarketAddress}><strong>Ubicación:</strong> {supermarket.address}</p>
                
                {renderOpeningHours(supermarket.opening_hours_periods)}

                <div className={styles.supermarketActions}>
                  {supermarket.website && (
                    <button onClick={(e) => handleLinkClick(e, supermarket.website!, supermarket.name)} className={`${styles.modalButton}`}>
                      Sitio Web
                    </button>
                  )}
                  {supermarket.Maps_url && (
                    <button onClick={(e) => handleLinkClick(e, supermarket.Maps_url!, supermarket.name)} className={`${styles.modalButton}`}>
                      Ver en Mapa
                    </button>
                  )}
                </div>
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
