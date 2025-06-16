import React, { useEffect, useState, useCallback } from 'react';
import { getUserHistoryAPI, HistoryRead } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import HistoryRecipeCard from '../components/HistoryRecipeCard/HistoryRecipeCard';
import styles from './HistoryPage.module.css';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUserHistoryAPI();
      setHistory(data);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el historial. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();

    const handleRefetch = () => {
        if (document.visibilityState === 'visible') {
            fetchHistory();
        }
    };

    window.addEventListener('focus', handleRefetch);
    document.addEventListener('visibilitychange', handleRefetch);

    return () => {
      window.removeEventListener('focus', handleRefetch);
      document.removeEventListener('visibilitychange', handleRefetch);
    };
  }, [fetchHistory]);

  if (isLoading && history.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && history.length === 0) {
    return <p className={styles.message}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mi Historial de Recetas</h1>
      {history.length > 0 ? (
        <div className={styles.grid}>
          {history.map(item => (
            <HistoryRecipeCard key={item.id} historyItem={item} />
          ))}
        </div>
      ) : (
         !isLoading && (
            <p className={styles.message}>
                Aún no has visitado ninguna receta. ¡Cuando lo hagas, aparecerán aquí!
            </p>
         )
      )}
    </div>
  );
};

export default HistoryPage;
