import React from 'react';
import styles from './IngredientsList.module.css';

interface IngredientsListProps {
  ingredients: string[];
  isAdapted: boolean;
  onIngredientClick: (item: string, index: number, event: React.MouseEvent<HTMLElement>) => void;
  isLoading: boolean;
}

const IngredientsList: React.FC<IngredientsListProps> = ({ ingredients, isAdapted, onIngredientClick, isLoading }) => {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Ingredientes {isAdapted && <span className={styles.aiBadge}>Adaptado por IA</span>}
      </h2>
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