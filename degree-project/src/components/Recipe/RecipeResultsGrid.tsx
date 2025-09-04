import React from 'react';
import { Link } from 'react-router-dom';
import { RecipeSearchResult } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import styles from './RecipeResultsGrid.module.css';

interface RecipeResultsGridProps {
  recipes: RecipeSearchResult[] | null;
  isLoading: boolean;
  error: string | null;
}

const RecipeResultsGrid: React.FC<RecipeResultsGridProps> = ({ recipes, isLoading, error }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (!recipes || recipes.length === 0) {
    return <p className={styles.infoText}>No se encontraron recetas para tu búsqueda.</p>;
  }

  return (
    <div className={styles.searchResultsList}>
      {recipes.map((result) => (
        <Link
          key={result.url}
          to={`/recipe/details?url=${encodeURIComponent(result.url)}`}
          state={{ recipe: result.recipe_data }}
          className={styles.searchResultItem}
        >
          <div className={styles.imageWrapper}>
            <img
              src={result.image_url || "/icons/Burger_192.webp"}
              alt={`Imagen de ${result.title}`}
              className={styles.recipeImage}
              loading="lazy"
            />
          </div>
          <div className={styles.itemContent}>
            <h3>{result.title}</h3>
            <span className={styles.detailsLink}>Ver Detalles →</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecipeResultsGrid;