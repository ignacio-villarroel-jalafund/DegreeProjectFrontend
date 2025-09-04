import React from "react";
import { useFavorites } from "../hooks/useFavorites";
import RecipeResultsGrid from "../components/Recipe/RecipeResultsGrid";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import styles from "./FavoritesPage.module.css";
import { ScrapedRecipeData, NutritionInfo } from "../services/api";

const FavoritesPage: React.FC = () => {
  const { favorites, isLoading, error } = useFavorites();

  const favoriteSearchResults = favorites.map((fav) => {
    let nutritionData: NutritionInfo | null = null;
    try {
      if (fav.nutrition && typeof fav.nutrition === "string") {
        nutritionData = JSON.parse(fav.nutrition);
      }
    } catch (e) {
      console.error(
        "Error al parsear la información nutricional desde favoritos:",
        fav.nutrition
      );
    }

    const recipeData: ScrapedRecipeData = {
      title: fav.recipe_name,
      servings: fav.servings,
      ingredients:
        typeof fav.ingredients === "string"
          ? fav.ingredients.split("\n").filter((i) => i.trim() !== "")
          : [],
      directions:
        typeof fav.directions === "string"
          ? fav.directions.split("\n").filter((d) => d.trim() !== "")
          : [],
      url: fav.url,
      image_url: fav.img_src || null,
      nutrition: nutritionData,
    };

    console.log(JSON.stringify(recipeData));

    return {
      title: fav.recipe_name,
      url: fav.url,
      image_url: fav.img_src || "",
      recipe_data: recipeData,
    };
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mis Recetas Favoritas</h1>
      {isLoading && <LoadingSpinner />}
      {error && <p className={styles.message}>{error}</p>}
      {!isLoading &&
        !error &&
        (favorites.length > 0 ? (
          <RecipeResultsGrid
            recipes={favoriteSearchResults}
            isLoading={false}
            error={null}
          />
        ) : (
          <p className={styles.message}>
            Aún no has guardado ninguna receta como favorita. ¡Cuando lo hagas,
            aparecerán aquí!
          </p>
        ))}
    </div>
  );
};

export default FavoritesPage;
