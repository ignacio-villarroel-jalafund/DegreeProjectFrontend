import { useState, useEffect, useCallback } from 'react';
import { getRecommendations } from '../services/recommendations';
import { Recommendation } from '../services/api';
import { useAuth } from './useAuth';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchRecommendations = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(10);
      setRecommendations(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "No se pudieron cargar las recomendaciones.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, isLoading, error, refetch: fetchRecommendations };
};
