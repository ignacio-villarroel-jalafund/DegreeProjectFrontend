import { useState, useEffect } from "react";
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

  useEffect(() => {
    sessionStorage.setItem(ACTIVE_BUTTON_STORAGE_KEY, activeButton);

    if (isLoadingLocation) {
      setPageTitle("Detectando tu ubicación...");
      return;
    }

    let query = "Recetas internacionales";
    let title = "Recetas populares internacionalmente";

    if (locationError) {
        setActiveButton("popular");
    }

    switch (activeButton) {
      case "local":
        if (locationInfo) {
          query = `Recetas de ${locationInfo.city}`;
          title = `Recetas populares en ${locationInfo.city}`;
        } else {
          setActiveButton("popular"); // Fallback
        }
        break;
      case "nacional":
        if (locationInfo) {
          const countryDisplay = locationInfo.countryFullName || locationInfo.countryCode;
          query = `Recetas de ${countryDisplay}`;
          title = `Recetas populares en ${countryDisplay}`;
        } else {
          setActiveButton("popular"); // Fallback
        }
        break;
      case "popular":
        break;
    }

    setPageTitle(title);
    handleSearch(query);
  }, [activeButton, locationInfo, isLoadingLocation, locationError, handleSearch]);

  return {
    pageTitle,
    activeButton,
    setActiveButton,
    locationHook
  };
};