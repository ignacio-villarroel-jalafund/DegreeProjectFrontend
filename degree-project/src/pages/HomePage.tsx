import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSearch } from '../contexts/SearchContext';
import { RecipeSearchResult } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const { isLoading: authLoading } = useAuth();
  const {
    searchResults,
    isLoadingSearch,
    searchError,
    searchPerformed
  } = useSearch();

  const isLoading = authLoading || isLoadingSearch;
  const displayResults = searchPerformed && searchResults !== null;

  return (
    <div>
      <h2>{searchPerformed ? 'Resultados de Búsqueda' : 'Busca una Receta'}</h2>

      {isLoading && <LoadingSpinner />}

      {!isLoading && searchError && searchPerformed && (
          <p style={{ color: 'red', textAlign: 'center' }}>{searchError}</p>
      )}

      {!isLoading && !searchError && displayResults && searchResults.length > 0 && (
        <div className={styles.searchResultsList}>
          {searchResults.map((result: RecipeSearchResult) => {
            return (
              <div key={result.url} className={styles.searchResultItem}>
                {result.image_url && (
                  <img 
                    src={result.image_url} 
                    alt={`Imagen de ${result.title}`}
                    className={styles.recipeImage}
                  />
                )}

                <h3>{result.title}</h3>
                <Link to={`/recipe/details?url=${encodeURIComponent(result.url)}`} className={styles.detailsLink}>
                  Ver Detalles
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !searchError && displayResults && searchResults.length === 0 && (
          <p style={{ textAlign: 'center' }}>No se encontraron recetas para tu búsqueda.</p>
      )}

      {!isLoading && !searchPerformed && (
          <p style={{ textAlign: 'center' }}>Ingresa un término en la barra superior para buscar recetas.</p>
      )}
    </div>
  );
};

export default HomePage;