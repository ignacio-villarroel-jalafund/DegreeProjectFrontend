import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import { RecipeSearchResult } from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import styles from "./HomePage.module.css";

const SearchResultsPage: React.FC = () => {
  const { searchResults, isLoadingSearch, searchError, handleSearch } = useSearch();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    if (query) {
      setPageTitle(`Resultados para "${query}"`);
      handleSearch(query);
    } else {
      setPageTitle("No se especificó una búsqueda.");
    }
  }, [query, handleSearch]);

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
      <h2 className={styles.pageTitle}>
        {isLoadingSearch ? `Buscando "${query}"...` : pageTitle}
      </h2>

      {isLoadingSearch && <LoadingSpinner />}

      {!isLoadingSearch && searchError && (
        <p className={styles.errorText}>{searchError}</p>
      )}

      {!isLoadingSearch &&
        !searchError &&
        searchResults &&
        searchResults.length > 0 &&
        renderResults(searchResults)}

      {!isLoadingSearch &&
        !searchError &&
        searchResults?.length === 0 && (
          <p className={styles.infoText}>
            No se encontraron recetas para tu búsqueda.
          </p>
        )}
    </div>
  );
};

export default SearchResultsPage;