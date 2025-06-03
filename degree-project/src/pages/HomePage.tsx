import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import { RecipeSearchResult } from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import styles from "./HomePage.module.css";

interface LocationInfo {
  city: string;
  country: string;
}

type ActiveButtonType = "local" | "nacional" | "popular";

const HomePage: React.FC = () => {
  const {
    searchResults,
    isLoadingSearch,
    searchError,
    handleSearch,
  } = useSearch();

  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [pageTitle, setPageTitle] = useState("Buscando recetas para ti...");
  const [activeButton, setActiveButton] = useState<ActiveButtonType | null>(
    null
  );

  useEffect(() => {
    const fetchLocationAndSearch = async () => {
      setIsLoadingLocation(true);
      try {
        const response = await fetch("https://ip-api.com/json/");
        if (!response.ok) throw new Error("No se pudo obtener la ubicación.");
        const data = await response.json();
        const location: LocationInfo = {
          city: data.city,
          country: data.country,
        };
        setLocationInfo(location);

        const initialQuery = `Recetas de ${location.city}`;
        setPageTitle(`Recetas populares en ${location.city}`);
        await handleSearch(initialQuery);
        setActiveButton("local");
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocationInfo({ city: "cochabamba", country: "bolivia" });
        setPageTitle("Recetas populares internacionalmente");
        await handleSearch("Recetas internacionales");
        setActiveButton("popular");
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocationAndSearch();
  }, []);

  const isLoading = isLoadingLocation || isLoadingSearch;

  const renderResults = (results: RecipeSearchResult[]) => (
    <div className={styles.searchResultsList}>
      {results.map((result) => (
        <Link
          key={result.url}
          to={`/recipe/details?url=${encodeURIComponent(result.url)}`}
          className={styles.searchResultItem}
        >
          <div className={styles.imageWrapper}>
            <img
              src={result.image_url || "/icons/Burger_192.webp"}
              alt={`Imagen de ${result.title}`}
              className={styles.recipeImage}
              loading="lazy"
            />
          </div>
          <div className={styles.itemContent}>
            <h3>{result.title}</h3>
            <span className={styles.detailsLink}>Ver Detalles →</span>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div className={styles.homePageContainer}>
      <div className={styles.suggestionButtons}>
        <button
          onClick={() => {
            setActiveButton("local");
            setPageTitle(
              `Recetas populares en ${locationInfo?.city || "la región"}`
            );
            handleSearch(`Recetas de ${locationInfo?.city || "cochabamba"}`);
          }}
          className={`${styles.suggestionButton} ${
            activeButton === "local" ? styles.active : ""
          }`}
          disabled={isLoading}
        >
          Recetas Locales
        </button>
        <button
          onClick={() => {
            setActiveButton("nacional");
            setPageTitle(
              `Recetas populares en ${locationInfo?.country || "el país"}`
            );
            handleSearch(`Recetas de ${locationInfo?.country || "bolivia"}`);
          }}
          className={`${styles.suggestionButton} ${
            activeButton === "nacional" ? styles.active : ""
          }`}
          disabled={isLoading}
        >
          Recetas Nacionales
        </button>
        <button
          onClick={() => {
            setActiveButton("popular");
            setPageTitle("Recetas populares internacionalmente");
            handleSearch("Recetas internacionales");
          }}
          className={`${styles.suggestionButton} ${
            activeButton === "popular" ? styles.active : ""
          }`}
          disabled={isLoading}
        >
          Recetas Internacionales
        </button>
      </div>

      <h2 className={styles.pageTitle}>
        {isLoading ? "Buscando..." : pageTitle}
      </h2>

      {isLoading && <LoadingSpinner />}

      {!isLoading && searchError && (
        <p className={styles.errorText}>{searchError}</p>
      )}

      {!isLoading &&
        !searchError &&
        searchResults &&
        searchResults.length > 0 &&
        renderResults(searchResults)}

    </div>
  );
};

export default HomePage;
