import { useState, useEffect, useCallback } from 'react';
import { ScrapedRecipeData } from '../services/api';
import { recipeService } from '../services/recipe.service';

export const useRecipe = (recipeUrl: string | null) => {
  const [recipe, setRecipe] = useState<ScrapedRecipeData | null>(null);
  const [isAdapted, setIsAdapted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
    if (recipeUrl) {
      fetchRecipe(recipeUrl);
    } else {
      setError("No se proporcionó una URL de receta válida.");
      setIsLoading(false);
    }
  }, [recipeUrl, fetchRecipe]);

  const updateRecipeData = useCallback((newRecipe: ScrapedRecipeData, adapted: boolean) => {
      setRecipe(newRecipe);
      setIsAdapted(adapted);
  }, []);

  return { recipe, isAdapted, isLoading, error, updateRecipeData };
};