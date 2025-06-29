import React from "react";
import { useSearch } from "../contexts/SearchContext";
import styles from "./HomePage.module.css";
import { useHomePageLogic } from "../hooks/useHomePageLogic";
import SearchSuggestionBar from "../components/HomePage/SearchSuggestionBar";
import LocationDisplay from "../components/HomePage/LocationDisplay";
import RecipeResultsGrid from "../components/Recipe/RecipeResultsGrid";

const HomePage: React.FC = () => {
  const { searchResults, isLoadingSearch, searchError } = useSearch();
  const { pageTitle, activeButton, setActiveButton, locationHook } = useHomePageLogic();
  const { locationInfo, isLoading: isLoadingLocation } = locationHook;

  const isLoading = isLoadingSearch || isLoadingLocation;

  return (
    <div className={styles.homePageContainer}>
      <SearchSuggestionBar
        activeButton={activeButton}
        onButtonClick={setActiveButton}
        isLoading={isLoading}
        hasLocation={!!locationInfo}
      />

      <h2 className={styles.pageTitle}>{pageTitle}</h2>

      <LocationDisplay locationHook={locationHook} />

      <RecipeResultsGrid
        recipes={searchResults}
        isLoading={isLoading}
        error={searchError}
      />
    </div>
  );
};

export default HomePage;