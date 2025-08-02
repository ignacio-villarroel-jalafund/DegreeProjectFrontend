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
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ recipe, isAdapted }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite, isLoading } = useFavorites();

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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (favoriteStatus.isFavorite) {
      if (favoriteStatus.recipeId) {
        removeFavorite(favoriteStatus.recipeId);
      }
    } else {
      addFavorite(recipe, isAdapted);
    }
  };

  return (
    <button onClick={handleToggleFavorite} disabled={isLoading} className={styles.favoriteButton}>
      {favoriteStatus.isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;
