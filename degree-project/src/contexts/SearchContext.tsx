import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { searchRecipesAPI, RecipeSearchResult } from '../services/api';

interface SearchContextType {
  searchResults: RecipeSearchResult[] | null;
  isLoadingSearch: boolean;
  searchError: string | null;
  searchPerformed: boolean;
  handleSearch: (query: string, loadMore?: boolean) => Promise<void>;
  clearSearch: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
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
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleSearch = useCallback(async (query: string, loadMore = false) => {
    const pageToFetch = loadMore ? currentPage + 1 : 0;
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingSearch(true);
      setSearchResults(null);
      setHasMore(false);
    }
    setSearchError(null);
    setSearchPerformed(true);

    try {
      const results = await searchRecipesAPI(query, pageToFetch * 10, 10);
      setSearchResults(prev => (loadMore && prev ? [...prev, ...results] : results));
      setHasMore(results.length === 10);
      setCurrentPage(pageToFetch);
    } catch (err: any) {
      if (loadMore) {
        setHasMore(false);
      } else {
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
      }
    } finally {
      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoadingSearch(false);
      }
    }
  }, [currentPage]);

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchError(null);
    setSearchPerformed(false);
    setCurrentPage(0);
    setHasMore(false);
  }, []);

  const value = {
    searchResults,
    isLoadingSearch,
    searchError,
    searchPerformed,
    handleSearch,
    clearSearch,
    hasMore,
    isLoadingMore,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
