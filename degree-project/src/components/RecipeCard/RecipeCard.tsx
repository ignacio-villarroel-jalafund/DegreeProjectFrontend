import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../../services/api';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link to={`/recipes/${recipe.url}`} className={styles.cardLink}>
      <div className={styles.recipeCard}>
        <div className={styles.imageContainer}>
          <img 
            src={recipe.image_url}
            alt={recipe.title} 
            className={styles.recipeImage} 
            loading="lazy" 
          />
        </div>
        <div className={styles.recipeContent}>
          <h3 className={styles.recipeTitle}>{recipe.title}</h3>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;