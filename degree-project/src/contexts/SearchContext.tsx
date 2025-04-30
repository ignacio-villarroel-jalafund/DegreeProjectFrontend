import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { searchRecipesAPI, RecipeSearchResult } from '../services/api';

interface SearchContextType {
  searchResults: RecipeSearchResult[] | null;
  isLoadingSearch: boolean;
  searchError: string | null;
  searchPerformed: boolean;
  handleSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<RecipeSearchResult[] | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    console.log(`Searching for: ${query}`);
    setIsLoadingSearch(true);
    setSearchError(null);
    setSearchResults(null);
    setSearchPerformed(true);

    try {
      const results = await searchRecipesAPI(query);
      console.log('Search results received:', results);
      setSearchResults(results);

      if (!results || results.length === 0) {
          console.log('No recipes found for query:', query);
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error during search:", err);
      let errorMessage = "Error al realizar la búsqueda.";
      if (!navigator.onLine) {
         errorMessage = "Error de búsqueda. Parece que estás offline.";
      } else if (err.response) {
          const detail = err.response.data?.detail;
          errorMessage = `Error de búsqueda: ${detail || err.response.statusText || 'Error del servidor'}`;
          if (err.response.status === 404) {
              errorMessage = "No se encontraron recetas para esa búsqueda.";
          }
      }
      setSearchError(errorMessage);
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
      setSearchResults(null);
      setSearchError(null);
      setSearchPerformed(false);
      console.log('Search cleared');
  }, []);

  const value = {
    searchResults,
    isLoadingSearch,
    searchError,
    searchPerformed,
    handleSearch,
    clearSearch,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};