import React, { useEffect } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useRecipe } from '../hooks/useRecipe';
import { useRecipeAdaptation } from '../hooks/useRecipeAdaptation';
import { useIngredientInteraction } from '../hooks/useIngredientInteraction';

import LoadingSpinner from '../components/UI/LoadingSpinner';
import RecipeHeader from '../components/Recipe/RecipeHeader';
import RecipeActions from '../components/Recipe/RecipeActions';
import IngredientsList from '../components/Recipe/IngredientsList';
import DirectionsList from '../components/Recipe/DirectionsList';
import IngredientPreviewModal from '../components/Modals/IngredientPreviewModal';
import SupermarketModal from '../components/Modals/SupermarketModal';
import IngredientContextMenu from '../components/Recipe/IngredientContextMenu';

import styles from './RecipeDisplayPage.module.css';

const RecipeDisplayPage: React.FC = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const recipeUrl = new URLSearchParams(routerLocation.search).get('url');

  // --- Hooks ---
  const { recipe, isAdapted, isLoading: isLoadingRecipe, error: recipeError, updateRecipeData } = useRecipe(recipeUrl);
  
  const { adaptRecipe, isLoading: isLoadingAdaptation, error: adaptationError } = useRecipeAdaptation(recipe, updateRecipeData);
  
  const { 
    ingredientMenu, setIngredientMenu,
    preview, setPreview,
    isPreviewLoading,
    supermarketModal, setSupermarketModal,
    menuRef,
    handleSearchOnline,
    handleFindSupermarkets,
    handleLoadMoreSupermarkets,
    isLoadingLocation
  } = useIngredientInteraction();

  // --- Effects ---
  // Cierra el menú contextual si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIngredientMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef, setIngredientMenu]);

  // --- Handlers ---
  // CORRECCIÓN: Se implementa la lógica para mostrar el menú contextual
  const handleIngredientClick = (item: string, index: number, event: React.MouseEvent<HTMLElement>) => {
    if (isLoadingAdaptation) return;
    
    // Si el menú ya está abierto para este item, lo cerramos.
    if (ingredientMenu?.index === index) {
      setIngredientMenu(null);
      return;
    }

    const buttonElement = event.currentTarget as HTMLElement;
    const menuWidth = 220; // Ancho aproximado del menú
    
    // Calcula la posición del menú a la izquierda del botón
    const calculatedX = buttonElement.offsetLeft - menuWidth - 5;
    const calculatedY = buttonElement.offsetTop;
    
    setIngredientMenu({ index, name: item, x: calculatedX, y: calculatedY });
  };

  // --- Render Logic ---
  if (isLoadingRecipe) return <LoadingSpinner />;
  if (recipeError || !recipe) return <p className={styles.error}>Error: {recipeError || "No se pudo cargar la receta."}</p>;

  return (
    <div className={styles.displayPage}>
      {(isLoadingAdaptation || isPreviewLoading) && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
          <p>
            {isLoadingAdaptation ? 'La IA está cocinando tu petición...' 
              : isPreviewLoading ? 'Buscando información...' 
              : 'Cargando receta...'}
          </p>
        </div>
      )}

      <IngredientContextMenu
        menuState={ingredientMenu}
        menuRef={menuRef}
        onSearchOnline={handleSearchOnline}
        onFindSupermarkets={handleFindSupermarkets}
        onClose={() => setIngredientMenu(null)}
        isLoadingLocation={isLoadingLocation}
      />

      {preview && (
        <IngredientPreviewModal 
            previewState={preview}
            isLoading={isPreviewLoading}
            onClose={() => setPreview(null)}
        />
      )}
      
      <SupermarketModal
        modalState={supermarketModal}
        onClose={() => setSupermarketModal(prev => ({ ...prev, isOpen: false }))}
        onLoadMore={handleLoadMoreSupermarkets}
      />

      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ← Volver
      </button>

      <RecipeHeader recipe={recipe} />
      <RecipeActions recipe={recipe} adaptRecipe={adaptRecipe} isLoading={isLoadingAdaptation} error={adaptationError} isAdapted={isAdapted} />
      <IngredientsList ingredients={recipe.ingredients || []} isAdapted={isAdapted} onIngredientClick={handleIngredientClick} isLoading={isLoadingAdaptation} />
      <DirectionsList directions={recipe.directions || []} isAdapted={isAdapted} />

      {recipe.url && (
        <div className={styles.section}>
          <p>
            Fuente: <a href={recipe.url} target="_blank" rel="noopener noreferrer" className={styles.link}>Ver receta original</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplayPage;