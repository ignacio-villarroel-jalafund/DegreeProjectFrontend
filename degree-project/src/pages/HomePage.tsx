import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import { RecipeSearchResult, getSubdivisionsAPI, SubdivisionData } from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import styles from "./HomePage.module.css";
import { useLocation, LocationInfo } from "../hooks/useLocation";

type ActiveButtonType = "local" | "nacional" | "popular";

const HomePage: React.FC = () => {
  const {
    searchResults,
    isLoadingSearch,
    searchError: searchContextError,
    handleSearch,
  } = useSearch();

  const {
    locationInfo: activeLocation,
    isLoading: isLoadingLocation,
    error: locationError,
    isOverridden,
    detectedIpLocation,
    overrideLocation,
    clearOverriddenLocation,
  } = useLocation();

  const [pageTitle, setPageTitle] = useState("Buscando recetas para ti...");
  const [activeButton, setActiveButton] = useState<ActiveButtonType | null>(null);

  const [showLocationCorrection, setShowLocationCorrection] = useState(false);
  const [subdivisions, setSubdivisions] = useState<string[]>([]);
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>("");
  const [isLoadingSubdivisions, setIsLoadingSubdivisions] = useState(false);
  const [correctionUiError, setCorrectionUiError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadingLocation) {
      setPageTitle("Detectando tu ubicación...");
      return;
    }

    if (locationError && !activeLocation) {
      setPageTitle("Recetas populares internacionalmente (fallback)");
      console.error("HomePage: Error de ubicación severo:", locationError);
      handleSearch("Recetas internacionales");
      setActiveButton("popular");
      return;
    }

    if (activeLocation) {
      setPageTitle(`Recetas populares en ${activeLocation.city}`);
      handleSearch(`Recetas de ${activeLocation.city}`);
      setActiveButton("local");
    }
  }, [activeLocation, isLoadingLocation, locationError, handleSearch]);

  const handleOpenCorrectionUI = async () => {
    if (!activeLocation?.countryCode) {
      setCorrectionUiError("No se ha detectado un país para buscar subdivisiones.");
      return;
    }
    setShowLocationCorrection(true);
    setIsLoadingSubdivisions(true);
    setCorrectionUiError(null);
    setSubdivisions([]);
    setSelectedSubdivision("");

    try {
      const data: SubdivisionData = await getSubdivisionsAPI(activeLocation.countryCode);
      if (data.subdivisions && data.subdivisions.length > 0) {
        setSubdivisions(data.subdivisions);
        if (data.subdivisions.includes(activeLocation.city)) {
          setSelectedSubdivision(activeLocation.city);
        } else if (activeLocation.countryCode === "BO" && activeLocation.city.includes("Department")) {
          const cityNameOnly = activeLocation.city.replace(" Department", "");
          if (data.subdivisions.includes(cityNameOnly)) {
            setSelectedSubdivision(cityNameOnly);
          }
        }
      } else {
        setCorrectionUiError(data.message || "No se encontraron subdivisiones para este país.");
        setSubdivisions([]);
      }
    } catch (error: any) {
      console.error("Error fetching subdivisions:", error);
      setCorrectionUiError(error.response?.data?.detail || error.message || "Error al cargar las subdivisiones.");
      setSubdivisions([]);
    } finally {
      setIsLoadingSubdivisions(false);
    }
  };

  const handleConfirmNewLocation = async () => {
    if (!selectedSubdivision || !activeLocation) {
      setCorrectionUiError("Por favor, selecciona una ubicación.");
      return;
    }

    const newLocationForOverride: LocationInfo = {
      ...activeLocation,
      city: selectedSubdivision,
    };
    overrideLocation(newLocationForOverride);
    setShowLocationCorrection(false);
  };
  
  const handleResetLocation = async () => {
    setShowLocationCorrection(false);
    await clearOverriddenLocation();
  };

  const isLoadingOverall = isLoadingLocation || isLoadingSearch;

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
            if (activeLocation) {
              setActiveButton("local");
              setPageTitle(`Recetas populares en ${activeLocation.city}`);
              handleSearch(`Recetas de ${activeLocation.city}`);
            }
          }}
          className={`${styles.suggestionButton} ${activeButton === "local" ? styles.active : ""}`}
          disabled={isLoadingOverall || !activeLocation}
        >
          Recetas Locales
        </button>
        <button
          onClick={() => {
            if (activeLocation) {
              setActiveButton("nacional");
              const countryDisplay = activeLocation.countryFullName || activeLocation.countryCode;
              setPageTitle(`Recetas populares en ${countryDisplay}`);
              handleSearch(`Recetas de ${countryDisplay}`);
            }
          }}
          className={`${styles.suggestionButton} ${activeButton === "nacional" ? styles.active : ""}`}
          disabled={isLoadingOverall || !activeLocation}
        >
          Recetas Nacionales
        </button>
        <button
          onClick={() => {
            setActiveButton("popular");
            setPageTitle("Recetas populares internacionalmente");
            handleSearch("Recetas internacionales");
          }}
          className={`${styles.suggestionButton} ${activeButton === "popular" ? styles.active : ""}`}
          disabled={isLoadingOverall}
        >
          Recetas Internacionales
        </button>
      </div>

      <h2 className={styles.pageTitle}>
        {isLoadingLocation
          ? "Detectando ubicación..."
          : isLoadingSearch && activeLocation
          ? `Buscando en ${activeLocation.city}...`
          : pageTitle}
      </h2>

      {locationError && !isLoadingLocation && !showLocationCorrection && !activeLocation && (
         <div className={styles.locationCorrectionTrigger}>
            <p className={styles.errorTextSmall}>Error al detectar ubicación: {locationError}. Mostrando contenido global.</p>
         </div>
      )}
      
      {!showLocationCorrection && activeLocation && !isLoadingLocation && (
        <div className={styles.locationInfoArea}>
          <div className={styles.locationText}>
            <span>
              Ubicación para recetas: {activeLocation.city}, {activeLocation.countryFullName}.
            </span>
            <button onClick={handleOpenCorrectionUI} className={styles.linkButton}>
              ¿No es correcto?
            </button>
          </div>
          {isOverridden && detectedIpLocation && (
            <div className={styles.detectedLocationInfo}>
              <span>(Detectada: {detectedIpLocation.city}, {detectedIpLocation.countryFullName})</span>
              <button onClick={handleResetLocation} className={`${styles.linkButton} ${styles.resetButton}`}>
                Usar ubicación detectada
              </button>
            </div>
          )}
        </div>
      )}

      {showLocationCorrection && activeLocation && (
        <div className={styles.locationCorrectionUI}>
          <h4>Corregir ubicación para {activeLocation.countryFullName}</h4>
          {isLoadingSubdivisions && <LoadingSpinner />}
          {!isLoadingSubdivisions && subdivisions.length > 0 && (
            <div className={styles.selectContainer}>
              <select
                value={selectedSubdivision}
                onChange={(e) => setSelectedSubdivision(e.target.value)}
                className={styles.subdivisionSelect}
              >
                <option value="">
                  -- Selecciona tu {activeLocation.countryCode === "BO" ? "departamento" : activeLocation.countryCode === "US" ? "estado" : "región/provincia"} --
                </option>
                {subdivisions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <button
                onClick={handleConfirmNewLocation}
                className={styles.confirmButton}
                disabled={!selectedSubdivision || selectedSubdivision === activeLocation.city}
              >
                Actualizar Ubicación
              </button>
            </div>
          )}
          {correctionUiError && <p className={styles.errorTextSmall}>{correctionUiError}</p>}
          {!isLoadingSubdivisions && subdivisions.length === 0 && !correctionUiError && (
            <p className={styles.infoText}>No hay subdivisiones disponibles para este país o ya se mostraron.</p>
          )}
          <button
            onClick={() => setShowLocationCorrection(false)}
            className={`${styles.cancelButton} ${styles.correctionCancelButton}`}
          >
            Cancelar Corrección
          </button>
        </div>
      )}

      {isLoadingOverall && !showLocationCorrection && <LoadingSpinner />}

      {!isLoadingOverall && searchContextError && (
        <p className={styles.errorText}>{searchContextError}</p>
      )}

      {!isLoadingOverall &&
        !searchContextError &&
        searchResults &&
        searchResults.length > 0 &&
        renderResults(searchResults)}
      
      {!isLoadingOverall && !searchContextError && searchResults && searchResults.length === 0 && (
        <p className={styles.infoText}>No se encontraron recetas para tu búsqueda.</p>
      )}
    </div>
  );
};

export default HomePage;
