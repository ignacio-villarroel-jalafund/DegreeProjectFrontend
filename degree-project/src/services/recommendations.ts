import { apiClient, RecipeRead } from "./api";

export const getRecommendations = async (
  limit: number = 10
): Promise<RecipeRead[]> => {
  const response = await apiClient.get<RecipeRead[]>("/recommendations/", {
    params: { limit },
  });
  return response.data;
};
