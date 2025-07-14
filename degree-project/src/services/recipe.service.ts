import {
  scrapeRecipeAPI,
  adaptRecipeAPI,
  getIngredientInfoAPI,
  findSupermarketsAPI,
  ScrapedRecipeData,
  RecipeAdaptationRequest,
  AnalysisType,
  IngredientInfoResponse,
  RecipeAdaptationResponse,
  SupermarketSearchResponse
} from './api';

export const recipeService = {
  scrapeRecipe: async (url: string): Promise<ScrapedRecipeData> => {
    return await scrapeRecipeAPI(url);
  },

  adaptRecipe: async (
    recipeData: ScrapedRecipeData,
    type: AnalysisType,
    details: Record<string, any>
  ): Promise<RecipeAdaptationResponse> => {
    const requestBody: RecipeAdaptationRequest = {
      recipe_data: recipeData,
      adaptation: { type, details },
    };
    return await adaptRecipeAPI(requestBody);
  },

  getIngredientInfo: async (ingredientName: string): Promise<IngredientInfoResponse> => {
    return await getIngredientInfoAPI(ingredientName);
  },

  findSupermarkets: async (
    city: string,
    country: string,
    pageToken?: string | null
  ): Promise<SupermarketSearchResponse> => {
    return await findSupermarketsAPI(city, country, 'es', pageToken, 10);
  }
};
