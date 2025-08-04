import { useState, useEffect, useCallback } from "react";
import { useSearch } from "../contexts/SearchContext";
import { useLocation } from "./useLocation";

type ActiveButtonType = "local" | "nacional" | "popular";
const ACTIVE_BUTTON_STORAGE_KEY = 'homePageActiveButtonSelection';

export const useHomePageLogic = () => {
  const { handleSearch } = useSearch();
  const locationHook = useLocation();
  const { locationInfo, isLoading: isLoadingLocation, error: locationError } = locationHook;

  const [pageTitle, setPageTitle] = useState("Buscando recetas para ti...");
  const [activeButton, setActiveButton] = useState<ActiveButtonType>(() => {
    return (sessionStorage.getItem(ACTIVE_BUTTON_STORAGE_KEY) as ActiveButtonType) || "local";
  });
  const [currentQuery, setCurrentQuery] = useState("");

  const executeSearch = useCallback((query: string, loadMore = false) => {
    if (query) {
      handleSearch(query, loadMore);
    }
  }, [handleSearch]);

  useEffect(() => {
    sessionStorage.setItem(ACTIVE_BUTTON_STORAGE_KEY, activeButton);

    if (isLoadingLocation) {
      setPageTitle("Detectando tu ubicación...");
      return;
    }

    let query = "Recetas internacionales";
    let title = "Recetas internacionales";

    if (locationError) {
      setActiveButton("popular");
    }

    switch (activeButton) {
      case "local":
        if (locationInfo) {
          query = `Recetas de ${locationInfo.city}`;
          title = `Recetas de ${locationInfo.city}`;
        } else {
          setActiveButton("popular");
        }
        break;
      case "nacional":
        if (locationInfo) {
          const countryDisplay = locationInfo.countryFullName || locationInfo.countryCode;
          query = `Recetas de ${countryDisplay}`;
          title = `Recetas de ${countryDisplay}`;
        } else {
          setActiveButton("popular");
        }
        break;
      case "popular":
        break;
    }

    setPageTitle(title);
    setCurrentQuery(query);
    executeSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeButton, locationInfo, isLoadingLocation, locationError]);

  const loadMore = () => {
    if (currentQuery) {
      executeSearch(currentQuery, true);
    }
  };

  return {
    pageTitle,
    activeButton,
    setActiveButton,
    locationHook,
    loadMore,
  };
};
