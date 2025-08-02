import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getFavoritesAPI, addFavoriteAPI, removeFavoriteAPI, ScrapedRecipeData, RecipeRead } from '../services/api';

interface FavoritesContextType {
  favorites: RecipeRead[];
  isLoading: boolean;
  error: string | null;
  isFavorite: (recipe: ScrapedRecipeData) => { isFavorite: boolean; recipeId: string | null };
  addFavorite: (recipeData: ScrapedRecipeData, isAdapted: boolean) => Promise<void>;
  removeFavorite: (recipeId: string) => Promise<void>;
  fetchFavorites: () => void;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<RecipeRead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFavoritesAPI();
      setFavorites(data || []);
    } catch (err) {
      setError("No se pudieron cargar los favoritos.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, fetchFavorites]);

  const isFavorite = useCallback((recipe: ScrapedRecipeData): { isFavorite: boolean, recipeId: string | null } => {
    const found = favorites.find(fav => fav.url === recipe.url);
    const result = {
      isFavorite: !!found,
      recipeId: found ? found.id : null
    };
    return result;
  }, [favorites]);

  const addFavorite = async (recipeData: ScrapedRecipeData, isAdapted: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      await addFavoriteAPI({ recipe_data: recipeData, is_adapted: isAdapted });
      await fetchFavorites();
    } catch (err) {
      setError("No se pudo añadir a favoritos.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (recipeId: string) => {
    if (!recipeId) {
      setError("No se pudo identificar la receta para eliminar.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await removeFavoriteAPI(recipeId);
      await fetchFavorites();
    } catch (err) {
      setError("No se pudo eliminar de favoritos.");
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(() => ({
    favorites,
    isLoading: isLoading || isAuthLoading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    fetchFavorites
  }), [favorites, isLoading, isAuthLoading, error, isFavorite, addFavorite, removeFavorite, fetchFavorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
