import React from 'react';
import styles from '../../pages/RecipeDisplayPage.module.css';
import { IngredientMenuState } from '../../hooks/useIngredientInteraction';

interface IngredientContextMenuProps {
  menuState: IngredientMenuState;
  // CORRECCIÓN: Se permite que la ref pueda ser null.
  menuRef: React.RefObject<HTMLDivElement | null>;
  onSearchOnline: (ingredient: string) => void;
  onFindSupermarkets: (ingredient: string) => void;
  onClose: () => void;
  isLoadingLocation: boolean;
}

const IngredientContextMenu: React.FC<IngredientContextMenuProps> = ({
  menuState,
  menuRef,
  onSearchOnline,
  onFindSupermarkets,
  onClose,
  isLoadingLocation
}) => {
  if (!menuState) return null;

  return (
    <div
      ref={menuRef as React.RefObject<HTMLDivElement>}
      className={styles.ingredientContextMenu}
      style={{
        position: 'absolute',
        top: `${menuState.y}px`,
        left: `${menuState.x}px`,
        zIndex: 101,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.menuTitle} title={menuState.name}>
        {menuState.name}
      </div>
      <button onClick={() => onSearchOnline(menuState.name)} className={styles.menuButton}>
        Buscar ingrediente en línea
      </button>
      <button
        onClick={() => onFindSupermarkets(menuState.name)}
        className={styles.menuButton}
        disabled={isLoadingLocation}
      >
        {isLoadingLocation ? 'Cargando ubicación...' : 'Buscar supermercados locales'}
      </button>
      <button onClick={onClose} className={`${styles.menuButton} ${styles.menuButtonCancel}`}>
        Cerrar Menú
      </button>
    </div>
  );
};

export default IngredientContextMenu;