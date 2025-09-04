import { useState, useEffect, useCallback } from 'react';
import { ScrapedRecipeData } from '../services/api';
import { recipeService } from '../services/recipe.service';

const isRecipeDataComplete = (recipe: ScrapedRecipeData | null): boolean => {
  if (!recipe) return false;
  return !!(
    recipe.title &&
    recipe.ingredients && recipe.ingredients.length > 0 &&
    recipe.directions && recipe.directions.length > 0
  );
};

export const useRecipe = (recipeUrl: string | null, recipeFromState: ScrapedRecipeData | null) => {
  const [recipe, setRecipe] = useState<ScrapedRecipeData | null>(recipeFromState || null);
  const [isAdapted, setIsAdapted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(!isRecipeDataComplete(recipeFromState));
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recipeService.scrapeRecipe(url);
      setRecipe(data);
      setIsAdapted(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Error al obtener los datos de la receta.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((!isRecipeDataComplete(recipeFromState) || !recipeFromState) && recipeUrl) {
      fetchRecipe(recipeUrl);
    }
  }, [recipeUrl, fetchRecipe, recipeFromState]);

  const updateRecipeData = useCallback((newRecipe: ScrapedRecipeData, adapted: boolean) => {
      setRecipe(newRecipe);
      setIsAdapted(adapted);
  }, []);

  return { recipe, isAdapted, isLoading, error, updateRecipeData };
};