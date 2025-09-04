import React from "react";
import { useRecipeDisplay } from "../hooks/useRecipeDisplay";
import { useConfirmation } from "../hooks/useConfirmation";

import LoadingSpinner from "../components/UI/LoadingSpinner";
import RecipeHeader from "../components/Recipe/RecipeHeader";
import RecipeActions from "../components/Recipe/RecipeActions";
import IngredientsList from "../components/Recipe/IngredientsList";
import DirectionsList from "../components/Recipe/DirectionsList";
import IngredientPreviewModal from "../components/Modals/IngredientPreviewModal";
import SupermarketModal from "../components/Modals/SupermarketModal";
import IngredientContextMenu from "../components/Recipe/IngredientContextMenu";

import styles from "./RecipeDisplayPage.module.css";
import FavoriteButton from "../components/FavoriteButton/FavoriteButton";

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
    isPreviewLoading,
  } = useRecipeDisplay();

  const { showConfirmation } = useConfirmation();

  if (isLoading && !recipe) return <LoadingSpinner />;
  if (recipeError || !recipe)
    return (
      <p className={styles.error}>
        Error: {recipeError || "No se pudo cargar la receta."}
      </p>
    );

  const handleExternalLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    showConfirmation(url, 'Estás a punto de ver la receta en su sitio original. ¿Deseas continuar?');
  };

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
        onClose={() => setIngredientMenu(null)}
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
        onClose={() =>
          setSupermarketModal((prev) => ({ ...prev, isOpen: false }))
        }
        onLoadMore={handleLoadMoreSupermarkets}
      />

      <div className={styles.headerControls}>
        <button onClick={handleGoBack} className={styles.backButton}>
          ← Volver
        </button>
        <FavoriteButton recipe={recipe} isAdapted={isAdapted} isRecipeLoading={isLoading} />
      </div>

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
        onFindSupermarketsClick={handleFindSupermarkets}
        isLoading={isLoading}
        isLoadingLocation={isLoadingLocation}
      />

      <DirectionsList
        directions={recipe.directions || []}
        isAdapted={isAdapted}
      />

      {recipe.url && (
        <div className={styles.section}>
          <p>
            Fuente:{" "}
            <a
              href={recipe.url}
              onClick={(e) => handleExternalLinkClick(e, recipe.url!)}
              className={styles.link}
            >
              Ver receta original
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplayPage;
