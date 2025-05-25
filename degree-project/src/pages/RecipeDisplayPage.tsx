import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  scrapeRecipeAPI,
  adaptRecipeAPI,
  ScrapedRecipeData,
  RecipeAdaptationRequest,
  AnalysisType,
} from "../services/api";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import styles from "./RecipeDisplayPage.module.css";

const substitutionSuggestions: Record<string, string[]> = {
  leche: ["Leche de almendras", "Leche de avena", "Leche de soja"],
  "harina de trigo": [
    "Harina de almendras (sin gluten)",
    "Harina de garbanzos (sin gluten)",
  ],
  harina: ["Harina de maíz", "Harina de arroz"],
  mantequilla: ["Margarina vegana", "Aceite de coco"],
  huevo: ["Sustituto de huevo vegano", "Puré de plátano"],
  azúcar: ["Stevia", "Sirope de arce"],
};

type EditingIngredientState = { index: number; original: string } | null;
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

  const [editingIngredient, setEditingIngredient] =
    useState<EditingIngredientState>(null);
  const [scalingState, setScalingState] = useState<ScalingState>({
    active: false,
    value: 0,
  });
  const [, setCustomSubstitution] = useState("");

  const scrapeFetched = useRef(false);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleAdaptationRequest = async (
    type: AnalysisType,
    details: Record<string, any>
  ) => {
    if (!scrapedData) return;
    setIsLoadingAdaptation(true);
    setAdaptationError(null);
    setEditingIngredient(null);
    setScalingState((prev) => ({ ...prev, active: false }));

    const requestBody: RecipeAdaptationRequest = {
      recipe_data: scrapedData,
      adaptation: { type, details },
    };

    try {
      const response = await adaptRecipeAPI(requestBody);
      setScrapedData(response.updated_recipe);
      setAdaptationCompleted(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleSelectSubstitution = (target: string) => {
    if (editingIngredient && target) {
      handleAdaptationRequest("SUBSTITUTE_INGREDIENT", {
        from: editingIngredient.original,
        to: target,
      });
      setCustomSubstitution("");
    }
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
          Toca un ingrediente para ver opciones de sustitución.
        </p>
        <ul className={styles.list}>
          {ingredientsList.map((item, index) => (
            <li
              key={index}
              className={styles.interactiveItem}
              onClick={() =>
                !isLoadingAdaptation &&
                setEditingIngredient({ index, original: item })
              }
            >
              {editingIngredient?.index === index ? (
                <div className={styles.ingredientEditView}>
                  <h4>Sustituir "{item}"</h4>
                  <div className={styles.substitutionSuggestions}>
                    {Object.keys(substitutionSuggestions).find((key) =>
                      item.toLowerCase().includes(key)
                    ) ? (
                      substitutionSuggestions[
                        Object.keys(substitutionSuggestions).find((key) =>
                          item.toLowerCase().includes(key)
                        )!
                      ].map((sug) => (
                        <button
                          key={sug}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSubstitution(sug);
                          }}
                          className={styles.suggestionButton}
                        >
                          {sug}
                        </button>
                      ))
                    ) : (
                      <p className={styles.noSuggestions}>
                        No hay sugerencias automáticas.
                      </p>
                    )}
                  </div>
                  <div className={styles.customSubstitutionForm}></div>
                </div>
              ) : (
                <>
                  <span>{item}</span>
                  <button
                    className={styles.substituteButton}
                    title="Sustituir con IA"
                  >
                    ⇆
                  </button>
                </>
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
