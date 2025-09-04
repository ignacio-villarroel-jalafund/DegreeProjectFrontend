import { apiClient, Recommendation } from "./api";

export const getRecommendations = async (
  limit: number = 10
): Promise<Recommendation[]> => {
  const response = await apiClient.get<Recommendation[]>("/recommendations/", {
    params: { limit },
  });
  return response.data;
};
