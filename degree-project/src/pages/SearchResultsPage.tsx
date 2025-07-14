import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import RecipeResultsGrid from "../components/Recipe/RecipeResultsGrid";
import styles from "./HomePage.module.css";
import LoadMoreButton from "../components/UI/LoadMoreButton";

const SearchResultsPage: React.FC = () => {
  const { searchResults, isLoadingSearch, searchError, handleSearch, hasMore, isLoadingMore } = useSearch();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const loadMore = () => {
    if (query) {
      handleSearch(query, true);
    }
  };

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
      <LoadMoreButton
        hasMore={hasMore}
        isLoading={isLoadingMore}
        onClick={loadMore}
      />
    </div>
  );
};

export default SearchResultsPage;
