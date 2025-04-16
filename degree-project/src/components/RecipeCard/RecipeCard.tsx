import React from 'react';
import type { Recipe } from '../../services/api';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const imageUrl = recipe.img_src || '/icons/Burger_192.webp';

  return (
    <div className={styles.recipeCard}>
      <img src={imageUrl} alt={recipe.recipe_name} className={styles.recipeImage} loading="lazy" />
      <div className={styles.recipeContent}>
        <h3 className={styles.recipeTitle}>{recipe.recipe_name}</h3>
        {/*recipe.total_time && <span>🕒 {recipe.total_time} min</span>*/}
        {/* Enlace a una página de detalles (si la creas) */}
        {/* <Link to={`/recipes/${recipe.id}`} className={styles.detailsLink}>Ver Detalles</Link> */}
      </div>
    </div>
  );
};

export default RecipeCard;