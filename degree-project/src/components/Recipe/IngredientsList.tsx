import React from 'react';
import styles from './IngredientsList.module.css';

interface IngredientsListProps {
  ingredients: string[];
  isAdapted: boolean;
  onIngredientClick: (item: string, index: number, event: React.MouseEvent<HTMLElement>) => void;
  onFindSupermarketsClick: () => void;
  isLoading: boolean;
  isLoadingLocation: boolean;
}

const IngredientsList: React.FC<IngredientsListProps> = ({ 
  ingredients, 
  isAdapted, 
  onIngredientClick, 
  onFindSupermarketsClick, 
  isLoading, 
  isLoadingLocation 
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          Ingredientes {isAdapted && <span className={styles.aiBadge}>Adaptado por IA</span>}
        </h2>
        <button 
          className={styles.supermarketButton} 
          onClick={onFindSupermarketsClick}
          disabled={isLoading || isLoadingLocation}
        >
          {isLoadingLocation ? 'Obteniendo ubicación...' : 'Buscar Supermercados Locales'}
        </button>
      </div>
      <p className={styles.subtleText}>Toca el botón (⋮) de un ingrediente para ver más opciones.</p>
      <ul className={styles.list}>
        {(ingredients || []).map((item, index) => (
          <li key={index} className={styles.interactiveItem}>
            <span>{item}</span>
            <button
              className={styles.substituteButton}
              title="Más opciones"
              onClick={(e) => onIngredientClick(item, index, e as React.MouseEvent<HTMLElement>)}
              disabled={isLoading}
            >
              ⋮
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientsList;
