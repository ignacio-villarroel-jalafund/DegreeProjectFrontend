import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../../services/api';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link to={`/recipes/${recipe.id}`} className={styles.cardLink}>
      <div className={styles.recipeCard}>
        <img src={recipe.img_url} alt={recipe.recipe_name} className={styles.recipeImage} loading="lazy" />
        <div className={styles.recipeContent}>
          <h3 className={styles.recipeTitle}>{recipe.recipe_name}</h3>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;