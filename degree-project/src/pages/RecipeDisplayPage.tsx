import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    scrapeRecipeAPI,
    analyzeRecipeAPI,
    getTaskStatusAPI,
    ScrapedRecipeData,
    TaskResult
} from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import styles from './RecipeDisplayPage.module.css';

const RecipeDisplayPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const recipeUrl = queryParams.get('url');

  const [scrapedData, setScrapedData] = useState<ScrapedRecipeData | null>(null);
  const [isLoadingScrape, setIsLoadingScrape] = useState(true);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const [taskId, setTaskId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<TaskResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [pollingIntervalId, setPollingIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const scrapeFetched = useRef(false);

  useEffect(() => {
    if (!recipeUrl) {
      setScrapeError('No se proporcionó una URL de receta válida.');
      setIsLoadingScrape(false);
      return;
    }

    if (scrapeFetched.current) return;
    scrapeFetched.current = true;

    const fetchScrapedData = async () => {
      console.log(`Scraping URL: ${recipeUrl}`);
      setIsLoadingScrape(true);
      setScrapeError(null);
      try {
        const data = await scrapeRecipeAPI(recipeUrl);
        setScrapedData(data);
        console.log('Scraping successful:', data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error during scraping:', err);
        let errorMsg = 'Error al obtener los datos de la receta.';
        if (err.response?.data?.detail) {
            errorMsg = err.response.data.detail;
        } else if (err.message) {
            errorMsg = err.message;
        }
        setScrapeError(errorMsg);
      } finally {
        setIsLoadingScrape(false);
      }
    };

    fetchScrapedData();

  }, [recipeUrl]);

  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        console.log('Polling interval cleared.');
      }
    };
  }, [pollingIntervalId]);

  const checkTaskStatus = async (currentTaskId: string) => {
      console.log(`Checking status for task: ${currentTaskId}`);
      try {
          const response = await getTaskStatusAPI(currentTaskId);
          console.log('Task status response:', response);

          const status = response.status.toUpperCase();

          if (status === 'SUCCESS') {
              setAnalysisResult(response.result as TaskResult);
              setIsLoadingAnalysis(false);
              setAnalysisError(null);
              if (pollingIntervalId) clearInterval(pollingIntervalId);
              setPollingIntervalId(null);
              setTaskId(null);
              console.log('Analysis task succeeded.');
          } else if (status === 'FAILURE') {
              let errorMsg = 'La tarea de análisis falló.';
              if (response.result?.message) {
                  errorMsg = response.result.message;
              } else if (response.result?.exc_message) {
                  errorMsg = response.result.exc_message;
              }
              setAnalysisError(errorMsg);
              setIsLoadingAnalysis(false);
              setAnalysisResult(null);
              if (pollingIntervalId) clearInterval(pollingIntervalId);
              setPollingIntervalId(null);
              setTaskId(null);
              console.error('Analysis task failed.');
          } else if (status === 'PENDING' || status === 'STARTED' || status === 'RETRY') {
              console.log(`Task ${currentTaskId} status: ${status}. Continuing poll.`);
          } else {
              setAnalysisError(`Estado de tarea inesperado: ${response.status}`);
              setIsLoadingAnalysis(false);
              if (pollingIntervalId) clearInterval(pollingIntervalId);
              setPollingIntervalId(null);
              setTaskId(null);
          }
      } catch (error) {
          setAnalysisError('Error al consultar el estado del análisis.');
      }
  };


  const handleAnalyze = async () => {
    if (!scrapedData) {
      setAnalysisError('No hay datos de receta para analizar.');
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setTaskId(null);
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
    }


    console.log('Starting analysis for:', scrapedData.recipe_name);
    try {
      const response = await analyzeRecipeAPI(scrapedData);
      const newTaskId = response.task_id;
      setTaskId(newTaskId);
      console.log('Analysis task started with ID:', taskId);

      checkTaskStatus(newTaskId);
      const interval = setInterval(() => checkTaskStatus(newTaskId), 5000);
      setPollingIntervalId(interval);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error starting analysis task:', err);
      let errorMsg = 'Error al iniciar el análisis.';
      if (err.response?.data?.detail) {
          errorMsg = err.response.data.detail;
      }
      setAnalysisError(errorMsg);
      setIsLoadingAnalysis(false);
    }
  };

  if (isLoadingScrape) {
    return <LoadingSpinner />;
  }

  if (scrapeError) {
    return <p className={styles.error}>Error: {scrapeError}</p>;
  }

  if (!scrapedData) {
    return <p>No se pudieron cargar los datos de la receta.</p>;
  }

  const ingredientsList = scrapedData.ingredients || [];
  const directionsList = scrapedData.directions || [];
  const imageUrl = scrapedData.img_url || '/icons/Burger_192.webp';

  return (
    <div className={styles.displayPage}>
       <button onClick={() => navigate(-1)} className={styles.backButton}>
         ← Volver a Resultados
      </button>

      <h1 className={styles.title}>{scrapedData.recipe_name || 'Receta Sin Nombre'}</h1>

       {scrapedData.img_url && (
           <div className={styles.imageContainer}>
               <img src={imageUrl} alt={scrapedData.recipe_name || ''} className={styles.recipeImage} loading="lazy"/>
           </div>
       )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Ingredientes</h2>
        {ingredientsList.length > 0 ? (
          <ul className={styles.list}>
            {ingredientsList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No hay ingredientes especificados.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Instrucciones</h2>
        {directionsList.length > 0 ? (
           <ol className={`${styles.list} ${styles.orderedList}`}>
               {directionsList.map((step, index) => (
                   <li key={index}>{step}</li>
               ))}
           </ol>
        ) : (
          <p>No hay instrucciones especificadas.</p>
        )}
      </div>

       <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Análisis con IA</h2>
            <button
                onClick={handleAnalyze}
                disabled={isLoadingAnalysis || !!pollingIntervalId}
                className={styles.analyzeButton}
            >
                {isLoadingAnalysis ? 'Analizando...' : 'Analizar con IA'}
            </button>

            {isLoadingAnalysis && !analysisError && <LoadingSpinner />}

            {analysisError && (
                <p className={styles.error}>Error en el análisis: {analysisError}</p>
            )}

            {analysisResult && analysisResult.analysis && (
                <div className={styles.analysisResult}>
                    <h3>Resultado del Análisis:</h3>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{analysisResult.analysis}</p>
                </div>
            )}
             {analysisResult && !analysisResult.analysis && !analysisError && !isLoadingAnalysis && (
                 <p>Análisis completado, pero no se generó texto.</p>
             )}
       </div>

      {scrapedData.url && (
        <div className={styles.section}>
           <p>Fuente original: <a href={scrapedData.url} target="_blank" rel="noopener noreferrer" className={styles.link}>Ver receta original</a></p>
        </div>
      )}

    </div>
  );
};

export default RecipeDisplayPage;