import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import RecipeResultsGrid from "../components/Recipe/RecipeResultsGrid";
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

  return (
    <div className={styles.homePageContainer}>
      <h2 className={styles.pageTitle}>
        {isLoadingSearch ? `Buscando "${query}"...` : pageTitle}
      </h2>

      <RecipeResultsGrid
        recipes={searchResults}
        isLoading={isLoadingSearch}
        error={searchError}
      />
    </div>
  );
};

export default SearchResultsPage;