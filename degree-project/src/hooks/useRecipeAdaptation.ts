import { useState, useCallback } from 'react';
import { recipeService } from '../services/recipe.service';
import { ScrapedRecipeData, AnalysisType } from '../services/api';

export const useRecipeAdaptation = (
    originalRecipe: ScrapedRecipeData | null,
    onSuccess: (newRecipe: ScrapedRecipeData, isAdapted: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adaptRecipe = useCallback(async (type: AnalysisType, details: Record<string, any>) => {
    if (!originalRecipe) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await recipeService.adaptRecipe(originalRecipe, type, details);
      onSuccess(response.updated_recipe, true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Error al adaptar la receta.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [originalRecipe, onSuccess]);

  return { adaptRecipe, isLoading, error, clearError: () => setError(null) };
};