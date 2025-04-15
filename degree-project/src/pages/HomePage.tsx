import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiClient, searchApiClient, type Recipe, type SearchResponse } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SearchForm from '../components/SearchForm/SearchForm';
import RecipeCard from '../components/RecipeCard/RecipeCard';

const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [initialRecipes, setInitialRecipes] = useState<Recipe[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[] | null>(null);
  const recipesToDisplay = searchResults !== null ?
    searchResults : initialRecipes;

  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const fetchInitialRecipes = useCallback(async () => {
    if (searchResults !== null) return;

    console.log('Fetching initial recipes...');
    setIsLoadingInitial(true);
    setError(null);
    setSearchPerformed(false);

    try {
      const response = await apiClient.get<Recipe[]>('/recipes', {
          params: { skip: 0, limit: 20 }
      });
      console.log('Initial recipes received:', response.data);
      setInitialRecipes(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error fetching initial recipes:", err);
       if (!navigator.onLine) {
           setError("Estás offline. Mostrando datos cacheados si existen.");
       } else {
            setError("No se pudieron cargar las recetas iniciales.");
       }
      setInitialRecipes([]);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [searchResults]);

  useEffect(() => {
    if (!authLoading) {
      fetchInitialRecipes();
    }
  }, [authLoading, fetchInitialRecipes]);

  const handleSearch = async (query: string) => {
    console.log(`Searching for: ${query}`);
    setIsLoadingSearch(true);
    setError(null);
    setSearchResults(null);
    setSearchPerformed(true);

    try {
        const searchResponse = await searchApiClient.get<SearchResponse>('/search', {
            params: { q: query, top_k: 5 }
        });
        console.log('Search results IDs:', searchResponse.data);

        const resultItems = searchResponse.data.results;

        if (!resultItems || resultItems.length === 0) {
            setSearchResults([]);
            console.log('No recipe IDs found for query:', query);
            setIsLoadingSearch(false);
            return;
        }

        const recipeIds = resultItems.map(item => item.id);
        console.log('Fetching details for recipe IDs:', recipeIds);
        const recipePromises = recipeIds.map(id =>
            apiClient.get<Recipe>(`/recipes/${id}`).catch(err => {
                console.error(`Failed to fetch recipe ${id}:`, err);
                return null;
            })
        );

        const recipeResponses = await Promise.all(recipePromises);
        const foundRecipes = recipeResponses
            .filter(response => response !== null && response.status === 200)
            .map(response => response!.data);

        console.log('Fetched recipe details:', foundRecipes);
        setSearchResults(foundRecipes);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("Error during search:", err);
        if (!navigator.onLine) {
           setError("Error de búsqueda. Parece que estás offline.");
        } else if (err.response) {
           setError(`Error de búsqueda: ${err.response.statusText || 'Error del servidor'}`);
        }
        else {
            setError("Error al realizar la búsqueda.");
        }
        setSearchResults([]);
    } finally {
        setIsLoadingSearch(false);
    }
  };

  const isLoading = authLoading || isLoadingInitial || isLoadingSearch;

  return (
    <div>
      <h1>Bienvenido a la App de Recetas</h1>
      {isAuthenticated ? (
        <p>Estás conectado. ¡Explora o crea recetas!</p>
      ) : (
        <p>Conéctate o regístrate para empezar.</p>
      )}

      <SearchForm onSearch={handleSearch} isLoading={isLoadingSearch} />

      <h2>{searchResults !== null ? 'Resultados de la Búsqueda' : 'Recetas Recientes'}</h2>

      {isLoading && <LoadingSpinner />}

      {!isLoading && error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!isLoading && !error && recipesToDisplay.length > 0 && (
        <div className="recipe-grid">
          {recipesToDisplay.map((recipe) => (
             <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {!isLoading && !error && recipesToDisplay.length === 0 && (
         searchPerformed ?
         (
             <p style={{ textAlign: 'center' }}>No se encontraron recetas para tu búsqueda.</p>
         ) : (
            !searchPerformed && !isLoadingInitial && initialRecipes.length === 0 &&
             <p style={{ textAlign: 'center' }}>No hay recetas disponibles por el momento.</p>
         )
      )}
    </div>
  );
};

export default HomePage;