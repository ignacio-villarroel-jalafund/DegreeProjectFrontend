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
  const [activeButton, setActiveButton] = useState<ActiveButtonType | null>(null);

  const ipinfoToken = import.meta.env.VITE_IPINFO_TOKEN;

  useEffect(() => {
    const fetchLocationAndSearch = async () => {
      setIsLoadingLocation(true);

      if (!ipinfoToken) {
        console.error("HomePage: El token de IPINFO no está configurado en las variables de entorno (VITE_IPINFO_TOKEN).");
        const fallbackLocation: LocationInfo = { city: "cochabamba", country: "BO" };
        setLocationInfo(fallbackLocation);
        setPageTitle("Recetas populares internacionalmente (fallback por token)");
        try {
          await handleSearch("Recetas internacionales");
          setActiveButton("popular");
        } catch (searchFallbackError) {
          console.error("HomePage: Error durante el fallback search (sin token):", searchFallbackError);
        } finally {
          setIsLoadingLocation(false);
        }
        return;
      }

      const apiUrl = `https://ipinfo.io/json?token=${ipinfoToken}`;

      try {
        console.log(`HomePage: Fetching location from ${apiUrl}`);
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`HomePage: Error HTTP ${response.status} de ipinfo.io:`, errorData.error?.message || response.statusText);
          throw new Error(`Error ${response.status} de ipinfo.io: ${errorData.error?.message || 'No se pudo obtener la ubicación.'}`);
        }

        const data = await response.json();

        if (!data.region || !data.country) {
            console.warn("HomePage: La respuesta de ipinfo.io no incluyó ciudad o país.", data);
            throw new Error("Respuesta incompleta de ipinfo.io.");
        }

        const location: LocationInfo = {
          city: data.city,
          country: data.country,
        };

        console.log("HomePage: Ubicación obtenida de ipinfo.io:", location);
        setLocationInfo(location);

        const initialQuery = `Recetas de ${location.city}`;
        setPageTitle(`Recetas populares en ${location.city}`);
        await handleSearch(initialQuery);
        setActiveButton("local");

      } catch (error: any) {
        console.error("HomePage: Error fetching location from ipinfo.io or initial search:", error.message || error);
        const fallbackLocation: LocationInfo = { city: "cochabamba", country: "BO" };
        setLocationInfo(fallbackLocation);
        setPageTitle("Recetas populares internacionalmente (fallback por error)");
        try {
            await handleSearch("Recetas internacionales");
            setActiveButton("popular");
        } catch (searchFallbackError) {
            console.error("HomePage: Error during fallback search:", searchFallbackError);
        }
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocationAndSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipinfoToken]);

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
          disabled={isLoading || !locationInfo}
        >
          Recetas Locales
        </button>
        <button
          onClick={() => {
            setActiveButton("nacional");
            const countryDisplay = locationInfo?.country === "BO" ? "Bolivia" : (locationInfo?.country || "el país");
            setPageTitle(
              `Recetas populares en ${countryDisplay}`
            );
            handleSearch(`Recetas de ${countryDisplay === "el país" ? "bolivia" : countryDisplay}`);
          }}
          className={`${styles.suggestionButton} ${
            activeButton === "nacional" ? styles.active : ""
          }`}
          disabled={isLoading || !locationInfo}
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
      
      {!isLoading && !searchError && searchResults && searchResults.length === 0 && (
        <p className={styles.errorText}>No se encontraron recetas para tu búsqueda.</p>
      )}
    </div>
  );
};

export default HomePage;
