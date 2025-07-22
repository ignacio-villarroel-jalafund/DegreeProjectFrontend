import React, { useState, useEffect } from 'react';
import { AnalysisType, ScrapedRecipeData, Diet, Allergy, getAllergiesAPI, getDietsAPI } from '../../services/api';
import styles from '../../pages/RecipeDisplayPage.module.css';
import { FiChevronDown } from 'react-icons/fi';

interface RecipeActionsProps {
  recipe: ScrapedRecipeData;
  adaptRecipe: (type: AnalysisType, details: Record<string, any>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAdapted: boolean;
}

const RecipeActions: React.FC<RecipeActionsProps> = ({ recipe, adaptRecipe, isLoading, error, isAdapted }) => {
  const [scalingValue, setScalingValue] = useState(String(recipe.servings || 1));
  const [isScaling, setIsScaling] = useState(false);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dietsData, allergiesData] = await Promise.all([getDietsAPI(), getAllergiesAPI()]);
        setDiets(dietsData);
        setAllergies(allergiesData);
      } catch (error) {
        console.error("Error fetching adaptation options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleAdaptationChange = (type: "diet" | "allergy", event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value) {
      adaptRecipe("ADAPT_DIET", { [type]: value });
      event.target.value = "";
    }
  };

  const handleScaleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newServings = parseInt(scalingValue, 10);
      if(!isNaN(newServings) && newServings > 0){
          adaptRecipe("SCALE_PORTIONS", { new_servings: newServings });
          setIsScaling(false);
      }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Modificar Receta con IA</h2>
      {error && <p className={styles.error}>{error}</p>}
      {isAdapted && !error && !isLoading && <p className={styles.successText}>¡Receta adaptada exitosamente!</p>}

      <div className={styles.adaptationGrid}>
        <div className={styles.toolsGroup}>
          <h3 className={styles.toolsGroupTitle}>Adaptar a una Dieta</h3>
          <div className={styles.selectWrapper}>
            <select
              onChange={(e) => handleAdaptationChange("diet", e)}
              disabled={isLoading || diets.length === 0}
              className={styles.adaptationSelect}
              defaultValue=""
            >
              <option value="" disabled>Selecciona una dieta...</option>
              {diets.map(diet => (
                <option key={diet.id} value={diet.name}>{diet.name}</option>
              ))}
            </select>
            <FiChevronDown className={styles.selectArrowIcon} />
          </div>
        </div>

        <div className={styles.toolsGroup}>
          <h3 className={styles.toolsGroupTitle}>Evitar Alérgenos</h3>
          <div className={styles.selectWrapper}>
            <select
              onChange={(e) => handleAdaptationChange("allergy", e)}
              disabled={isLoading || allergies.length === 0}
              className={styles.adaptationSelect}
              defaultValue=""
            >
              <option value="" disabled>Selecciona un alérgeno...</option>
              {allergies.map(allergy => (
                <option key={allergy.id} value={allergy.name}>{allergy.name}</option>
              ))}
            </select>
            <FiChevronDown className={styles.selectArrowIcon} />
          </div>
        </div>
      </div>

      {typeof recipe.servings === 'number' && recipe.servings > 0 && (
          <div className={styles.toolsGroup}>
              <h3 className={styles.toolsGroupTitle}>Ajustar Cantidades (Porciones: {recipe.servings})</h3>
              {!isScaling ? (
                  <button onClick={() => setIsScaling(true)} disabled={isLoading} className={styles.toolButton}>Escalar Porciones</button>
              ) : (
                  <form onSubmit={handleScaleSubmit} className={styles.scalingForm}>
                      <input type="number" value={scalingValue} onChange={(e) => setScalingValue(e.target.value)} className={styles.formInput} min="1" />
                      <button type="submit" disabled={isLoading} className={styles.confirmButton}>Ajustar</button>
                      <button type="button" onClick={() => setIsScaling(false)} className={styles.cancelButton}>Cancelar</button>
                  </form>
              )}
          </div>
      )}
    </div>
  );
};

export default RecipeActions;
