import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation as useRouterLocation, useNavigate } from "react-router-dom";
import {
  scrapeRecipeAPI,
  adaptRecipeAPI,
  ScrapedRecipeData,
  RecipeAdaptationRequest,
  AnalysisType,
  getIngredientInfoAPI,
  IngredientInfoResponse,
  findSupermarketsAPI,
  SupermarketInfo as SupermarketInfoType,
} from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import styles from "./RecipeDisplayPage.module.css";

import { useLocation } from "../hooks/useLocation";

type IngredientMenuState = {
  index: number;
  name: string;
  x: number;
  y: number;
} | null;

type IngredientPreviewState = IngredientInfoResponse | null;

type ScalingState = { active: boolean; value: number };

type SupermarketModalState = {
  isOpen: boolean;
  ingredientName: string | null;
  results: SupermarketInfoType[] | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  nextPageToken: string | null;
};

const RecipeDisplayPage: React.FC = () => {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(routerLocation.search);
  const recipeUrl = queryParams.get("url");

  const [scrapedData, setScrapedData] = useState<ScrapedRecipeData | null>(null);
  const [isLoadingScrape, setIsLoadingScrape] = useState(true);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [isLoadingAdaptation, setIsLoadingAdaptation] = useState(false);
  const [adaptationError, setAdaptationError] = useState<string | null>(null);
  const [adaptationCompleted, setAdaptationCompleted] = useState(false);

  const [ingredientMenu, setIngredientMenu] = useState<IngredientMenuState>(null);
  const [scalingState, setScalingState] = useState<ScalingState>({
    active: false,
    value: 0,
  });

  const [ingredientPreview, setIngredientPreview] = useState<IngredientPreviewState>(null);
  const [isLoadingIngredientPreview, setIsLoadingIngredientPreview] = useState(false);

  const { locationInfo: userLocation, isLoading: isLoadingUserLocation, error: userLocationError } = useLocation();
  const [supermarketModal, setSupermarketModal] = useState<SupermarketModalState>({
    isOpen: false,
    ingredientName: null,
    results: null,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    nextPageToken: null,
  });

  const supermarketModalRef = useRef<HTMLDivElement>(null);
  const scrapeFetched = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ingredientPreviewModalRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!recipeUrl) {
      setScrapeError("No se proporcionó una URL de receta válida.");
      setIsLoadingScrape(false);
      return;
    }
    if (scrapeFetched.current) return;
    scrapeFetched.current = true;
    const fetchScrapedData = async () => {
      setIsLoadingScrape(true);
      setScrapeError(null);
      try {
        const data = await scrapeRecipeAPI(recipeUrl);
        setScrapedData(data);
        setScalingState({ active: false, value: data.servings || 1 });
      } catch (err: any) {
        let errorMsg = "Error al obtener los datos de la receta.";
        if (err.response?.data?.detail) errorMsg = err.response.data.detail;
        setScrapeError(errorMsg);
      } finally {
        setIsLoadingScrape(false);
      }
    };
    fetchScrapedData();
  }, [recipeUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIngredientMenu(null);
      }
      if (ingredientPreviewModalRef.current && !ingredientPreviewModalRef.current.contains(event.target as Node)) {
        setIngredientPreview(null);
      }
      if (supermarketModalRef.current && !supermarketModalRef.current.contains(event.target as Node) && supermarketModal.isOpen) {
        setSupermarketModal(prev => ({ ...prev, isOpen: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [supermarketModal.isOpen]);

  const handleAdaptationRequest = useCallback(async (
    type: AnalysisType,
    details: Record<string, any>
  ) => {
    if (!scrapedData) return;
    setIsLoadingAdaptation(true);
    setAdaptationError(null);
    setIngredientMenu(null);
    setIngredientPreview(null);
    setScalingState((prev) => ({ ...prev, active: false }));
    setSupermarketModal(prev => ({ ...prev, isOpen: false }));

    const requestBody: RecipeAdaptationRequest = {
      recipe_data: scrapedData,
      adaptation: { type, details },
    };

    try {
      const response = await adaptRecipeAPI(requestBody);
      setScrapedData(response.updated_recipe);
      setAdaptationCompleted(true);
    } catch (err: any) {
      console.error("Error during adaptation:", err);
      let errorMsg = "Error al adaptar la receta.";
      if (err.response?.data?.detail) errorMsg = err.response.data.detail;
      setAdaptationError(errorMsg);
    } finally {
      setIsLoadingAdaptation(false);
    }
  }, [scrapedData]);

  const handleAdaptDiet = useCallback((diet: "vegana" | "sin gluten" | "sin lactosa") => {
    handleAdaptationRequest("ADAPT_DIET", { diet });
  }, [handleAdaptationRequest]);

  const handleConfirmScale = useCallback(() => {
    const newServings = scalingState.value;
    if (newServings > 0) {
      handleAdaptationRequest("SCALE_PORTIONS", { new_servings: newServings });
    }
  }, [scalingState.value, handleAdaptationRequest]);

  const handleIngredientMenuToggle = useCallback((
    item: string,
    index: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    if (isLoadingAdaptation) return;

    if (ingredientMenu?.index === index && ingredientMenu?.name === item) {
      setIngredientMenu(null);
      return;
    }

    const buttonElement = event.currentTarget as HTMLElement;
    const menuWidth = menuRef.current?.offsetWidth || 220;

    let calculatedX = buttonElement.offsetLeft - menuWidth - 5;
    let calculatedY = buttonElement.offsetTop;

    setIngredientMenu({
      index,
      name: item,
      x: calculatedX,
      y: calculatedY,
    });
    setIngredientPreview(null);
    setSupermarketModal(prev => ({ ...prev, isOpen: false }));
  }, [isLoadingAdaptation, ingredientMenu, menuRef]);

  const handleSearchIngredientOnline = useCallback(async (ingredientNameFromMenu: string) => {
    setIngredientMenu(null);
    setIsLoadingIngredientPreview(true);
    setIngredientPreview(null);
    try {
      const data = await getIngredientInfoAPI(ingredientNameFromMenu);
      if (data && data.name) {
        setIngredientPreview(data);
      } else {
        const searchQuery = encodeURIComponent(`qué es ${ingredientNameFromMenu}`);
        setIngredientPreview({ name: ingredientNameFromMenu, image_url: null, search_url: `https://www.google.com/search?q=${searchQuery}` });
      }
    } catch (error: any) {
      const searchQuery = encodeURIComponent(`qué es ${ingredientNameFromMenu}`);
      setIngredientPreview({ name: ingredientNameFromMenu, image_url: null, search_url: `https://www.google.com/search?q=${searchQuery}` });
    } finally {
      setIsLoadingIngredientPreview(false);
    }
  }, []);

  const handleFindLocalSupermarkets = useCallback(async (ingredientName: string) => {
    setIngredientMenu(null);

    if (isLoadingUserLocation) {
        setSupermarketModal({ isOpen: true, ingredientName, isLoading: true, isLoadingMore: false, results: null, error: "Obteniendo tu ubicación...", nextPageToken: null });
        return;
    }

    if (userLocationError || !userLocation) {
        setSupermarketModal({ isOpen: true, ingredientName, isLoading: false, isLoadingMore: false, results: null, error: `No se pudo obtener tu ubicación. ${userLocationError || "Revisa permisos."}`, nextPageToken: null });
        return;
    }

    setSupermarketModal({ isOpen: true, ingredientName, isLoading: true, isLoadingMore: false, results: null, error: null, nextPageToken: null });

    try {
        const data = await findSupermarketsAPI(userLocation.city, userLocation.countryFullName, 'es', null, 10);
        setSupermarketModal(prev => ({
            ...prev,
            isLoading: false,
            results: data.supermarkets,
            nextPageToken: data.next_page_token || null,
            error: data.supermarkets.length === 0 ? (data.message || "No se encontraron supermercados.") : null,
        }));
    } catch (err: any) {
        let errorMsg = "Error al buscar supermercados.";
        if (err.response?.data?.detail) errorMsg = err.response.data.detail;
        else if (err.response?.data?.error) errorMsg = err.response.data.error;
        setSupermarketModal(prev => ({ ...prev, isLoading: false, error: errorMsg }));
    }
  }, [userLocation, isLoadingUserLocation, userLocationError]);

  const handleLoadMoreSupermarkets = useCallback(async () => {
    if (!supermarketModal.isOpen || supermarketModal.isLoadingMore || !supermarketModal.nextPageToken || !userLocation) {
      return;
    }

    setSupermarketModal(prev => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const data = await findSupermarketsAPI(
        userLocation.city,
        userLocation.countryFullName,
        'es',
        supermarketModal.nextPageToken,
        10
      );

      setSupermarketModal(prev => ({
        ...prev,
        results: prev.results ? [...prev.results, ...data.supermarkets] : data.supermarkets,
        nextPageToken: data.next_page_token || null,
        isLoadingMore: false,
      }));
    } catch (err: any) {
      let errorMsg = "Error al cargar más supermercados.";
      if (err.response?.data?.detail) errorMsg = err.response.data.detail;
      else if (err.response?.data?.error) errorMsg = err.response.data.error;
      setSupermarketModal(prev => ({ ...prev, isLoadingMore: false, error: errorMsg }));
    }
  }, [supermarketModal.isOpen, supermarketModal.isLoadingMore, supermarketModal.nextPageToken, userLocation]);

  const lastSupermarketElementRef = useCallback((node: HTMLLIElement | null) => {
    if (supermarketModal.isLoadingMore || !supermarketModal.nextPageToken) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && supermarketModal.nextPageToken) {
        handleLoadMoreSupermarkets();
      }
    }, { threshold: 1.0 });

    if (node) observer.current.observe(node);
  }, [supermarketModal.isLoadingMore, supermarketModal.nextPageToken, handleLoadMoreSupermarkets]);


  if (isLoadingScrape) return <LoadingSpinner />;
  if (scrapeError) return <p className={styles.error}>Error: {scrapeError}</p>;
  if (!scrapedData) return <p>No se pudieron cargar los datos de la receta.</p>;

  const ingredientsList = scrapedData.ingredients || [];
  const directionsList = scrapedData.directions || [];
  const imageUrl = scrapedData.image_url || "/icons/Burger_192.webp";

  const canScaleServings =
    scrapedData &&
    typeof scrapedData.servings === "number" &&
    scrapedData.servings > 0;

  return (
    <div className={styles.displayPage}>
      {isLoadingAdaptation && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
          <p>La IA está cocinando tu petición...</p>
        </div>
      )}
        {isLoadingIngredientPreview && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
          <p>Buscando información del ingrediente...</p>
        </div>
      )}

      {ingredientPreview && (
        <div className={styles.ingredientPreviewModalOverlay} onClick={() => setIngredientPreview(null)}>
          <div
            ref={ingredientPreviewModalRef}
            className={styles.ingredientPreviewModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{ingredientPreview.name || "Ingrediente"}</h3>
            {ingredientPreview.image_url ? (
              <img src={ingredientPreview.image_url} alt={ingredientPreview.name || "Ingrediente"} className={styles.ingredientPreviewImage} />
            ) : (
              <p className={styles.noImagePreview}>No hay imagen disponible.</p>
            )}
            {ingredientPreview.search_url && (
                <a href={ingredientPreview.search_url} target="_blank" rel="noopener noreferrer" className={`${styles.previewLinkButton} ${styles.modalButton}`}>
                  Ver más información
                </a>
            )}
            <button onClick={() => setIngredientPreview(null)} className={`${styles.previewCloseButton} ${styles.modalButton}`}>Cerrar</button>
          </div>
        </div>
      )}

      {supermarketModal.isOpen && (
        <div className={styles.supermarketModalOverlay} onClick={() => setSupermarketModal(prev => ({ ...prev, isOpen: false }))}>
          <div
            ref={supermarketModalRef}
            className={styles.supermarketModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Supermercados en tu Área</h3>
            {supermarketModal.isLoading ? (
              <LoadingSpinner />
            ) : supermarketModal.error && !supermarketModal.results?.length ? (
              <p className={styles.error}>{supermarketModal.error}</p>
            ) : supermarketModal.results && supermarketModal.results.length > 0 ? (
              <>
                <ul className={styles.supermarketList}>
                  {supermarketModal.results.map((supermarket, index) => {
                    const isLastElement = supermarketModal.results!.length === index + 1;
                    return (
                      <li
                        ref={isLastElement ? lastSupermarketElementRef : null}
                        key={supermarket.place_id + '-' + index}
                        className={styles.supermarketListItem}
                      >
                        <div className={styles.supermarketHeader}>
                          <strong>{supermarket.name}</strong>
                        </div>
                        <p className={styles.supermarketAddress}>{supermarket.address}</p>
                        {supermarket.rating !== undefined && supermarket.rating !== null && (
                          <p className={styles.supermarketDetail}>Calificación: {supermarket.rating} ({supermarket.user_ratings_total || 0} opiniones)</p>
                        )}
                        {supermarket.opening_hours_periods && supermarket.opening_hours_periods.length > 0 && (
                            <div className={styles.supermarketDetail}>
                                <strong>Horarios:</strong>
                                <ul className={styles.hoursList}>{supermarket.opening_hours_periods.map((line, i) => {
                                    const parts = line.split(': ');
                                    return (
                                        <li key={i} className={styles.hoursListItem}>
                                            <span className={styles.hoursDay}>{parts[0]}:</span>
                                            <span className={styles.hoursTime}>{parts.slice(1).join(': ')}</span>
                                        </li>
                                    );
                                })}</ul>
                            </div>
                        )}
                        <div className={styles.supermarketActions}>
                          {supermarket.website && (
                            <a href={supermarket.website} target="_blank" rel="noopener noreferrer" className={`${styles.modalButton}`}>
                              Visitar Web
                            </a>
                          )}
                          {supermarket.Maps_url && (
                            <a href={supermarket.Maps_url} target="_blank" rel="noopener noreferrer" className={`${styles.modalButton}`}>
                              Ver en Google Maps
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                  {supermarketModal.isLoadingMore && (
                    <li className={styles.loadingMoreListItem}>
                      <LoadingSpinner />
                    </li>
                  )}
                </ul>
                {supermarketModal.error && supermarketModal.results && supermarketModal.results.length > 0 && (
                        <p className={`${styles.error} ${styles.errorTextSmall}`}>{supermarketModal.error}</p>
                )}
                {!supermarketModal.nextPageToken && !supermarketModal.isLoadingMore && supermarketModal.results && supermarketModal.results.length > 0 && (
                    <p className={styles.infoText}>No hay más supermercados para mostrar.</p>
                )}
              </>
            ) : (
              <p>No se encontraron supermercados o no hay resultados para mostrar.</p>
            )}
            <button
              onClick={() => setSupermarketModal(prev => ({ ...prev, isOpen: false }))}
              className={`${styles.modalButton} ${styles.closeModalButton}`}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ← Volver
      </button>

      <h1 className={styles.title}>
        {scrapedData.title || "Receta Sin Nombre"}
      </h1>
      <div className={styles.imageContainer}>
        <img
          src={imageUrl}
          alt={scrapedData.title || ""}
          className={styles.recipeImage}
          loading="lazy"
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Modificar Receta con IA</h2>
        {adaptationError && <p className={styles.error}>{adaptationError}</p>}
        {adaptationCompleted && !adaptationError && <p className={styles.successText}>¡Receta adaptada exitosamente por la IA!</p>}

        <div className={styles.toolsGroup}>
          <h3 className={styles.toolsGroupTitle}>Adaptar a una Dieta</h3>
          <div className={styles.toolsGrid}>
            <button
              onClick={() => handleAdaptDiet("vegana")}
              disabled={isLoadingAdaptation}
              className={styles.toolButton}
            >
              Hacer Vegana
            </button>
            <button
              onClick={() => handleAdaptDiet("sin gluten")}
              disabled={isLoadingAdaptation}
              className={styles.toolButton}
            >
              Sin Gluten
            </button>
            <button
              onClick={() => handleAdaptDiet("sin lactosa")}
              disabled={isLoadingAdaptation}
              className={styles.toolButton}
            >
              Sin Lactosa
            </button>
          </div>
        </div>

        {canScaleServings && (
          <div className={styles.toolsGroup}>
            <h3 className={styles.toolsGroupTitle}>Ajustar Cantidades (Porciones Actuales: {scrapedData.servings})</h3>
            {scalingState.active ? (
              <form onSubmit={(e) => { e.preventDefault(); handleConfirmScale();}} className={styles.scalingForm}>
                <input
                  type="number"
                  value={scalingState.value}
                  onChange={(e) =>
                    setScalingState({
                      ...scalingState,
                      value: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className={styles.formInput}
                  placeholder="Nº de porciones"
                  min="1"
                />
                <button
                  type="submit"
                  disabled={isLoadingAdaptation || scalingState.value === (scrapedData.servings || 1)}
                  className={styles.confirmButton}
                >
                  Ajustar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setScalingState({ active: false, value: scrapedData.servings || 1 })
                  }
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <button
                onClick={() =>
                  setScalingState({ active: true, value: scrapedData.servings || 1 })
                }
                disabled={isLoadingAdaptation}
                className={styles.toolButton}
              >
                Escalar Porciones
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Ingredientes
          {adaptationCompleted && !adaptationError && (
            <span className={styles.aiBadge}>Adaptado por IA</span>
          )}
        </h2>
        <p className={styles.subtleText}>
          Toca el botón (⋮) de un ingrediente para ver más opciones.
        </p>
        <ul className={styles.list}>
          {ingredientsList.map((item, index) => (
            <li
              key={index}
              className={styles.interactiveItem}
            >
              <span>{item}</span>
              <button
                className={styles.substituteButton}
                title="Más opciones"
                onClick={(e) => {
                    e.stopPropagation();
                    handleIngredientMenuToggle(item, index, e as React.MouseEvent<HTMLElement>);
                }}
                disabled={isLoadingAdaptation}
              >
                ⋮
              </button>

              {ingredientMenu?.index === index && ingredientMenu?.name === item && (
                <div
                  ref={menuRef}
                  className={styles.ingredientContextMenu}
                  style={{
                    position: 'absolute',
                    top: `${ingredientMenu.y}px`,
                    left: `${ingredientMenu.x}px`,
                    zIndex: 101,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={styles.menuTitle}
                    title={ingredientMenu.name}
                  >
                    {ingredientMenu.name}
                  </div>
                  <button
                    onClick={() => handleSearchIngredientOnline(ingredientMenu.name)}
                    className={styles.menuButton}
                  >
                    Buscar ingrediente en línea
                  </button>
                  <button
                    onClick={() => handleFindLocalSupermarkets(ingredientMenu.name)}
                    className={styles.menuButton}
                    disabled={isLoadingUserLocation}
                  >
                    {isLoadingUserLocation ? "Cargando ubicación..." : "Buscar supermercados locales"}
                  </button>
                  <button
                    onClick={() => setIngredientMenu(null)}
                    className={`${styles.menuButton} ${styles.menuButtonCancel}`}
                  >
                    Cerrar Menú
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

        <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Instrucciones
          {adaptationCompleted && !adaptationError &&(
            <span className={styles.aiBadge}>Adaptado por IA</span>
          )}
        </h2>
        <ol className={`${styles.list} ${styles.orderedList}`}>
          {directionsList.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      {scrapedData.url && (
        <div className={styles.section}>
          <p>
            Fuente:{" "}
            <a
              href={scrapedData.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Ver receta original
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplayPage;
