import React from "react";
import { Link } from "react-router-dom";
import { RecipeRead } from "../../services/api";
import LoadingSpinner from "../UI/LoadingSpinner";
import styles from "./Recommendations.module.css";

interface RecommendationsProps {
  recipes: RecipeRead[] | null;
  isLoading: boolean;
  error: string | null;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  recipes,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div
        style={{ marginTop: "1rem", marginBottom: "1rem", textAlign: "center" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <div className={styles.recommendationsContainer}>
      <h2 className={styles.title}>Descubre Recetas Recomendadas</h2>
      <div className={styles.recommendationsList}>
        {recipes.map((result) => (
          <Link
            key={result.url}
            to={`/recipe/details?url=${encodeURIComponent(result.url)}`}
            className={styles.recommendationItem}
          >
            <div className={styles.imageWrapper}>
              <img
                src={result.img_src || "/icons/Burger_192.webp"}
                alt={`Imagen de ${result.recipe_name}`}
                className={styles.recipeImage}
                loading="lazy"
              />
            </div>
            <div className={styles.itemContent}>
              <h3>{result.recipe_name}</h3>
              <span className={styles.detailsLink}>Ver Detalles →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
