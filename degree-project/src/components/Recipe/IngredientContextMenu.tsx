import React from 'react';
import styles from '../../pages/RecipeDisplayPage.module.css';
import { IngredientMenuState } from '../../hooks/useIngredientInteraction';

interface IngredientContextMenuProps {
  menuState: IngredientMenuState;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onSearchOnline: (ingredient: string) => void;
  onClose: () => void;
}

const IngredientContextMenu: React.FC<IngredientContextMenuProps> = ({
  menuState,
  menuRef,
  onSearchOnline,
  onClose,
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
      <button onClick={onClose} className={`${styles.menuButton} ${styles.menuButtonCancel}`}>
        Cerrar Menú
      </button>
    </div>
  );
};

export default IngredientContextMenu;
