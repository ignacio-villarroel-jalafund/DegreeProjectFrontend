import React from "react";
import { ScrapedRecipeData } from "../../services/api";
import styles from "./RecipeHeader.module.css";

interface RecipeHeaderProps {
  recipe: ScrapedRecipeData;
}

const RecipeHeader: React.FC<RecipeHeaderProps> = ({ recipe }) => {
  const imageUrl = recipe.image_url || "/icons/Burger_192.webp";

  return (
    <>
      <h1 className={styles.title}>{recipe.title || "Receta Sin Nombre"}</h1>
      <div className={styles.recipeHeader}>
        <div className={styles.imageContainer}>
          <img
            src={imageUrl}
            alt={recipe.title || ""}
            className={styles.recipeImage}
            loading="lazy"
          />
        </div>
        <div className={styles.nutritionInfo}>
          <h3 className={styles.nutritionTitle}>Información Nutricional</h3>
          {recipe.nutrition ? (
            <>
              <ul className={styles.nutritionList}>
                <li>
                  <span>Colesterol</span>
                  <span>
                    {recipe.nutrition.cholesterol_mg != null
                      ? Number(recipe.nutrition.cholesterol_mg).toFixed(1)
                      : "N/A"}{" "}
                    mg
                  </span>
                </li>
                <li>
                  <span>Grasas Saturadas</span>
                  <span>
                    {recipe.nutrition.fat_saturated_g != null
                      ? Number(recipe.nutrition.fat_saturated_g).toFixed(1)
                      : "N/A"}{" "}
                    g
                  </span>
                </li>
                <li>
                  <span>Carbohidratos</span>
                  <span>
                    {recipe.nutrition.carbohydrates_total_g != null
                      ? Number(recipe.nutrition.carbohydrates_total_g).toFixed(
                          1
                        )
                      : "N/A"}{" "}
                    g
                  </span>
                </li>
                <li>
                  <span>Fibra</span>
                  <span>
                    {recipe.nutrition.fiber_g != null
                      ? Number(recipe.nutrition.fiber_g).toFixed(1)
                      : "N/A"}{" "}
                    g
                  </span>
                </li>
              </ul>
              <p className={styles.nutritionSource}>
                * {recipe.nutrition.source}
              </p>
            </>
          ) : (
            <p className={styles.nutritionNotAvailable}>No disponible.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default RecipeHeader;
