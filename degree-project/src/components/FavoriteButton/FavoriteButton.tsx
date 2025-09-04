import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useFavorites } from '../../hooks/useFavorites';
import { ScrapedRecipeData } from '../../services/api';
import styles from './FavoriteButton.module.css';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonProps {
  recipe: ScrapedRecipeData;
  isAdapted: boolean;
  isRecipeLoading: boolean;
}

const isRecipeDataComplete = (recipe: ScrapedRecipeData | null): boolean => {
    if (!recipe) return false;
    return !!(
      recipe.title &&
      recipe.ingredients && recipe.ingredients.length > 0 &&
      recipe.directions && recipe.directions.length > 0
    );
};

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ recipe, isAdapted, isRecipeLoading }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite, isLoading: isFavoriteLoading } = useFavorites();

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => navigate('/login')}
        className={`${styles.favoriteButton} ${styles.tooltip}`}
        data-tooltip="Inicia sesión para guardar"
      >
        <FaRegHeart />
      </button>
    );
  }

  const favoriteStatus = isFavorite(recipe);
  const isDataComplete = isRecipeDataComplete(recipe);
  
  const isDisabled = isRecipeLoading || !isDataComplete || isFavoriteLoading;
  
  let tooltipMessage = 'Añadir a favoritos';
  if (favoriteStatus.isFavorite) {
    tooltipMessage = 'Quitar de favoritos';
  }
  if (isRecipeLoading) {
    tooltipMessage = 'Cargando detalles de la receta...';
  } else if (!isDataComplete) {
    tooltipMessage = 'Información de la receta incompleta';
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isDataComplete) {
      console.warn("Intento de guardar una receta incompleta en favoritos.");
      return;
    }

    if (favoriteStatus.isFavorite) {
      if (favoriteStatus.recipeId) {
        removeFavorite(favoriteStatus.recipeId);
      }
    } else {
      addFavorite(recipe, isAdapted);
    }
  };

  return (
    <div className={styles.tooltip} data-tooltip={tooltipMessage}>
        <button
            onClick={handleToggleFavorite}
            disabled={isDisabled}
            className={styles.favoriteButton}
            aria-label={tooltipMessage}
        >
            {favoriteStatus.isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
        </button>
    </div>
  );
};

export default FavoriteButton;
