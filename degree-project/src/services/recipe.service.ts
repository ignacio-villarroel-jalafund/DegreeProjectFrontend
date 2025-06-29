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

const CACHE_PREFIX = "recipeData_";

interface CachedRecipeEntry {
  recipe: ScrapedRecipeData;
  isAdapted: boolean;
  timestamp: number;
}

export const cacheService = {
  get: (url: string): CachedRecipeEntry | null => {
    const key = `${CACHE_PREFIX}${encodeURIComponent(url)}`;
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as CachedRecipeEntry;
      } catch (e) {
        console.error("Failed to parse cached recipe:", e);
        localStorage.removeItem(key);
        return null;
      }
    }
    return null;
  },
  set: (url: string, data: ScrapedRecipeData, adapted: boolean): void => {
    const key = `${CACHE_PREFIX}${encodeURIComponent(url)}`;
    const entry: CachedRecipeEntry = {
      recipe: data,
      isAdapted: adapted,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.error("Failed to cache recipe:", e);
    }
  }
};

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