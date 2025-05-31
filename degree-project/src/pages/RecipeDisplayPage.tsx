import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  scrapeRecipeAPI,
  adaptRecipeAPI,
  ScrapedRecipeData,
  RecipeAdaptationRequest,
  AnalysisType,
  getIngredientInfoAPI,
  IngredientInfoResponse,
} from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import styles from "./RecipeDisplayPage.module.css";

type IngredientMenuState = {
  index: number;
  name: string;
  x: number;
  y: number;
} | null;

type IngredientPreviewState = IngredientInfoResponse | null;

type ScalingState = { active: boolean; value: number };

const RecipeDisplayPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const recipeUrl = queryParams.get("url");

  const [scrapedData, setScrapedData] = useState<ScrapedRecipeData | null>(
    null
  );
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

  const scrapeFetched = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ingredientPreviewModalRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAdaptationRequest = async (
    type: AnalysisType,
    details: Record<string, any>
  ) => {
    if (!scrapedData) return;
    setIsLoadingAdaptation(true);
    setAdaptationError(null);
    setIngredientMenu(null); 
    setIngredientPreview(null);
    setScalingState((prev) => ({ ...prev, active: false }));

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
  };

  const handleAdaptDiet = (diet: "vegana" | "sin gluten" | "sin lactosa") => {
    handleAdaptationRequest("ADAPT_DIET", { diet });
  };

  const handleConfirmScale = () => {
    const newServings = scalingState.value;
    if (newServings > 0) {
      handleAdaptationRequest("SCALE_PORTIONS", { new_servings: newServings });
    }
  };
  
  const handleIngredientClick = (
    item: string,
    index: number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    if (isLoadingAdaptation) return;
    let x = event.clientX + 10;
    let y = event.clientY + 10;

    setIngredientMenu({
      index,
      name: item,
      x: x, 
      y: y,
    });
    setIngredientPreview(null);
  };

  const handleSearchIngredientOnline = async (ingredientNameFromMenu: string) => {
    setIngredientMenu(null);
    setIsLoadingIngredientPreview(true);
    setIngredientPreview(null);
    console.log(`Buscando información online para: ${ingredientNameFromMenu}`);
    try {
      const data = await getIngredientInfoAPI(ingredientNameFromMenu);
      if (data && data.name) {
        setIngredientPreview(data);
      } else {
        console.warn("No valid ingredient info received from backend for:", ingredientNameFromMenu);
        const searchQuery = encodeURIComponent(`qué es ${ingredientNameFromMenu}`);
        window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
      }
    } catch (error: any) {
      console.error("Error fetching ingredient info:", error);
      setIngredientPreview({ name: ingredientNameFromMenu, image_url: null, search_url: `https://www.google.com/search?q=${encodeURIComponent(`qué es ${ingredientNameFromMenu}`)}` }); // Muestra un fallback
    } finally {
      setIsLoadingIngredientPreview(false);
    }
  };

  const handleFindLocalSupermarkets = (ingredientName: string) => {
    console.log(`Buscando supermercados para: ${ingredientName}`);
    setIngredientMenu(null);
    const searchQuery = encodeURIComponent(`supermercados cerca que vendan ${ingredientName}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, "_blank");
  };

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
                 <a href={ingredientPreview.search_url} target="_blank" rel="noopener noreferrer" className={styles.previewLinkButton}>
                    Ver más información
                 </a>
            )}
            <button onClick={() => setIngredientPreview(null)} className={styles.previewCloseButton}>Cerrar</button>
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
            <h3 className={styles.toolsGroupTitle}>Ajustar Cantidades</h3>
            {scalingState.active ? (
              <div className={styles.scalingForm}>
                <input
                  type="number"
                  value={scalingState.value}
                  onChange={(e) =>
                    setScalingState({
                      ...scalingState,
                      value: Number(e.target.value),
                    })
                  }
                  className={styles.formInput}
                  placeholder="Nº de porciones"
                />
                <button
                  onClick={handleConfirmScale}
                  disabled={isLoadingAdaptation}
                  className={styles.confirmButton}
                >
                  Ajustar
                </button>
                <button
                  onClick={() =>
                    setScalingState({ ...scalingState, active: false })
                  }
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  setScalingState({ ...scalingState, active: true })
                }
                disabled={isLoadingAdaptation}
                className={styles.toolButton}
              >
                Escalar Porciones ({scrapedData.servings})
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Ingredientes
          {adaptationCompleted && (
            <span className={styles.aiBadge}>Adaptado por IA</span>
          )}
        </h2>
        <p className={styles.subtleText}>
          Toca un ingrediente para ver más opciones.
        </p>
        <ul className={styles.list}>
          {ingredientsList.map((item, index) => (
            <li
              key={index}
              className={styles.interactiveItem}
              onClick={(e) => {
                if (ingredientMenu?.index === index) {
                    setIngredientMenu(null);
                } else {
                    handleIngredientClick(item, index, e as React.MouseEvent<HTMLElement>);
                }
              }}
            >
              <span>{item}</span>
              <button
                className={styles.substituteButton}
                title="Más opciones"
                onClick={(e) => {
                    e.stopPropagation();
                    if (ingredientMenu?.index === index) {
                        setIngredientMenu(null);
                    } else {
                        handleIngredientClick(item, index, e as React.MouseEvent<HTMLElement>);
                    }
                }}
              >
                ⋮
              </button>

              {ingredientMenu?.index === index && (
                <div
                  ref={menuRef}
                  className={styles.ingredientContextMenu}
                  style={{
                    position: 'absolute',
                    top: `${ingredientMenu.y}px`,
                    left: `${ingredientMenu.x}px`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.menuTitle}>{ingredientMenu.name}</div>
                  <button
                    onClick={() => handleSearchIngredientOnline(ingredientMenu.name)}
                    className={styles.menuButton}
                  >
                    Buscar "{ingredientMenu.name}" online
                  </button>
                  <button
                    onClick={() => handleFindLocalSupermarkets(ingredientMenu.name)}
                    className={styles.menuButton}
                  >
                    Buscar supermercados locales
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
          {adaptationCompleted && (
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
