import { useEffect } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useRecipe } from './useRecipe';
import { useRecipeAdaptation } from './useRecipeAdaptation';
import { useIngredientInteraction } from './useIngredientInteraction';

export const useRecipeDisplay = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const recipeUrl = new URLSearchParams(routerLocation.search).get('url');

  const {
    recipe,
    isAdapted,
    isLoading: isLoadingRecipe,
    error: recipeError,
    updateRecipeData
  } = useRecipe(recipeUrl);

  const {
    adaptRecipe,
    isLoading: isLoadingAdaptation,
    error: adaptationError
  } = useRecipeAdaptation(recipe, updateRecipeData);

  const {
    ingredientMenu, setIngredientMenu,
    preview, setPreview,
    isPreviewLoading,
    supermarketModal, setSupermarketModal,
    menuRef,
    handleSearchOnline,
    handleFindSupermarkets,
    handleLoadMoreSupermarkets,
    isLoadingLocation,
    closeAllModals,
  } = useIngredientInteraction();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIngredientMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef, setIngredientMenu]);

  const handleIngredientClick = (item: string, index: number, event: React.MouseEvent<HTMLElement>) => {
    if (isLoadingAdaptation) return;

    if (ingredientMenu?.index === index) {
      setIngredientMenu(null);
      return;
    }

    const buttonElement = event.currentTarget as HTMLElement;
    const menuWidth = 220;

    const container = buttonElement.closest('[class*="displayPage"]');
    if (!container) {
      console.error("No se pudo encontrar el contenedor de la página de la receta.");
      return;
    }

    const buttonRect = buttonElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const xRelativeToContainer = buttonRect.left - containerRect.left;
    const yRelativeToContainer = buttonRect.top - containerRect.top;

    const calculatedX = xRelativeToContainer - menuWidth - 5;
    const calculatedY = yRelativeToContainer;

    setIngredientMenu({ index, name: item, x: calculatedX, y: calculatedY });
  };


  const handleGoBack = () => navigate(-1);

  const isLoading = isLoadingRecipe || isLoadingAdaptation || isPreviewLoading;
  const loadingMessage = isLoadingAdaptation
    ? 'La IA está cocinando tu petición...'
    : isPreviewLoading
    ? 'Buscando información...'
    : 'Cargando receta...';

  return {
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
    closeAllModals
  };
};