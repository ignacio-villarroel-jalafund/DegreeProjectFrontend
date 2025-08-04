import React, { useMemo } from "react";
import { useSearch } from "../contexts/SearchContext";
import styles from "./HomePage.module.css";
import { useHomePageLogic } from "../hooks/useHomePageLogic";
import SearchSuggestionBar from "../components/HomePage/SearchSuggestionBar";
import LocationDisplay from "../components/HomePage/LocationDisplay";
import RecipeResultsGrid from "../components/Recipe/RecipeResultsGrid";
import LoadMoreButton from "../components/UI/LoadMoreButton";
import Recommendations from "../components/Recommendations/Recommendations";
import { useRecommendations } from "../hooks/useRecommendations";
import { useAuth } from "../hooks/useAuth";

const HomePage: React.FC = () => {
  const {
    searchResults,
    isLoadingSearch,
    searchError,
    hasMore,
    isLoadingMore,
  } = useSearch();
  const { pageTitle, activeButton, setActiveButton, locationHook, loadMore } =
    useHomePageLogic();
  const { locationInfo, isLoading: isLoadingLocation } = locationHook;
  const { isAuthenticated } = useAuth();
  const {
    recommendations: allRecommendations,
    isLoading: isLoadingRecs,
    error: recsError,
  } = useRecommendations();

  const isLoading = isLoadingSearch || isLoadingLocation;

  const randomRecommendations = useMemo(() => {
    if (!allRecommendations) {
      return null;
    }
    const shuffled = [...allRecommendations].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(6, shuffled.length));
  }, [allRecommendations]);

  return (
    <div className={styles.homePageContainer}>
      {isAuthenticated && (
        <Recommendations
          recipes={randomRecommendations}
          isLoading={isLoadingRecs}
          error={recsError}
        />
      )}

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
      <LoadMoreButton
        hasMore={hasMore}
        isLoading={isLoadingMore}
        onClick={loadMore}
      />
    </div>
  );
};

export default HomePage;
