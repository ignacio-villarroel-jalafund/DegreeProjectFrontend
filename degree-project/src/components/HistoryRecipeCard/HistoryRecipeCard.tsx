import React from "react";
import { Link } from "react-router-dom";
import { HistoryRead } from "../../services/api";
import styles from "./HistoryRecipeCard.module.css";

interface HistoryRecipeCardProps {
  historyItem: HistoryRead & { recipe_data: { updated_at?: string } };
}

const HistoryRecipeCard: React.FC<HistoryRecipeCardProps> = ({
  historyItem,
}) => {
  const { recipe_data, is_adapted, source_url, created_at } = historyItem;
  const lastVisitedTime = historyItem.updated_at || created_at;

  const imageUrl = recipe_data.image_url || "/icons/Burger_192.webp";

  const visitedDate = new Date(lastVisitedTime).toLocaleString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!source_url) {
    return (
      <div className={`${styles.card} ${styles.noLink}`}>
        <img
          src={imageUrl}
          alt={recipe_data.title || "Receta"}
          className={styles.cardImage}
          loading="lazy"
        />
        {is_adapted && <span className={styles.aiBadge}>Adaptado por IA</span>}
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>
            {recipe_data.title || "Receta sin título"}
          </h3>
          <p className={styles.visitedDate}>Visitado: {visitedDate}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/recipe/details?url=${encodeURIComponent(source_url)}`}
      className={styles.cardLink}
      state={{ recipe: recipe_data }}
    >
      <div className={styles.card}>
        <img
          src={imageUrl}
          alt={recipe_data.title || "Receta"}
          className={styles.cardImage}
          loading="lazy"
        />
        {is_adapted && <span className={styles.aiBadge}>Adaptado por IA</span>}
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>
            {recipe_data.title || "Receta sin título"}
          </h3>
          <p className={styles.visitedDate}>Visitado: {visitedDate}</p>
        </div>
      </div>
    </Link>
  );
};

export default HistoryRecipeCard;
