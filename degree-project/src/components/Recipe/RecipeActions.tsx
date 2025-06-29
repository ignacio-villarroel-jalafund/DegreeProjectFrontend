import React, { useState } from 'react';
import { AnalysisType, ScrapedRecipeData } from '../../services/api';
import styles from '../../pages/RecipeDisplayPage.module.css';

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
  
  const handleAdaptDiet = (diet: "vegana" | "sin gluten" | "sin lactosa") => {
    adaptRecipe("ADAPT_DIET", { diet });
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

      <div className={styles.toolsGroup}>
        <h3 className={styles.toolsGroupTitle}>Adaptar a una Dieta</h3>
        <div className={styles.toolsGrid}>
          <button onClick={() => handleAdaptDiet("vegana")} disabled={isLoading} className={styles.toolButton}>Hacer Vegana</button>
          <button onClick={() => handleAdaptDiet("sin gluten")} disabled={isLoading} className={styles.toolButton}>Sin Gluten</button>
          <button onClick={() => handleAdaptDiet("sin lactosa")} disabled={isLoading} className={styles.toolButton}>Sin Lactosa</button>
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