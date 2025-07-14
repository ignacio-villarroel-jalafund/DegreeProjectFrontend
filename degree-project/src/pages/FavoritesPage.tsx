import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import RecipeResultsGrid from '../components/Recipe/RecipeResultsGrid';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import styles from './FavoritesPage.module.css';

const FavoritesPage: React.FC = () => {
  const { favorites, isLoading, error } = useFavorites();

  const favoriteSearchResults = favorites.map(fav => ({
    title: fav.recipe_name,
    url: fav.url,
    image_url: fav.img_src || ''
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mis Recetas Favoritas</h1>
      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.message}>{error}</p>}
      {!isLoading && !error && (
        favorites.length > 0 ? (
          <RecipeResultsGrid 
            recipes={favoriteSearchResults} 
            isLoading={false} 
            error={null} 
          />
        ) : (
          <p className={styles.message}>
            Aún no has guardado ninguna receta como favorita. ¡Cuando lo hagas, aparecerán aquí!
          </p>
        )
      )}
    </div>
  );
};

export default FavoritesPage;