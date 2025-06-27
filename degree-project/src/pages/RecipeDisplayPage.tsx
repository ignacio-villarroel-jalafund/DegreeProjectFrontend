import React from 'react';
import { useRecipeDisplay } from '../hooks/useRecipeDisplay';

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
  const {
    recipe,
    isAdapted,
    recipeError,
    adaptationError,
    isLoading,
    loadingMessage,
    ingredientMenu,
    preview,
    supermarketModal,
    isLoadingLocation,
    menuRef,
    handleGoBack,
    adaptRecipe,
    handleIngredientClick,
    handleSearchOnline,
    handleFindSupermarkets,
    handleLoadMoreSupermarkets,
    setIngredientMenu,
    setPreview,
    setSupermarketModal,
  } = useRecipeDisplay();

  if (isLoading && !recipe) return <LoadingSpinner />;
  if (recipeError || !recipe) return <p className={styles.error}>Error: {recipeError || "No se pudo cargar la receta."}</p>;

  return (
    <div className={styles.displayPage}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
          <p>{loadingMessage}</p>
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
            isLoading={false}
            onClose={() => setPreview(null)}
        />
      )}
      
      <SupermarketModal
        modalState={supermarketModal}
        onClose={() => setSupermarketModal(prev => ({ ...prev, isOpen: false }))}
        onLoadMore={handleLoadMoreSupermarkets}
      />

      <button onClick={handleGoBack} className={styles.backButton}>
        ← Volver
      </button>

      <RecipeHeader recipe={recipe} />
      
      <RecipeActions 
        recipe={recipe} 
        adaptRecipe={adaptRecipe} 
        isLoading={isLoading} 
        error={adaptationError} 
        isAdapted={isAdapted} 
      />
      
      <IngredientsList 
        ingredients={recipe.ingredients || []} 
        isAdapted={isAdapted} 
        onIngredientClick={handleIngredientClick} 
        isLoading={isLoading} 
      />
      
      <DirectionsList 
        directions={recipe.directions || []} 
        isAdapted={isAdapted} 
      />

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