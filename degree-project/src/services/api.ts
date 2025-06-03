import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface RecipeSearchResult {
  title: string;
  url: string;
  image_url: string;
}

export interface ScrapedRecipeData {
  title?: string | null;
  servings?: number | null;
  ingredients?: string[] | null;
  directions?: string[] | null;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timing?: any | null;
  image_url?: string | null;
}

export interface AnalyzeTaskResponse {
  task_id: string;
}

export interface TaskResult {
  status?: string;
  analysis?: string | null;
  message?: string | null;
  recipe_id?: string | null;
  error?: string;
  exc_type?: string;
  exc_message?: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY' | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: TaskResult | any | null;
}

export type AnalysisType = 'SUBSTITUTE_INGREDIENT' | 'ADAPT_DIET' | 'SCALE_PORTIONS';

export interface AdaptationRequest {
  type: AnalysisType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>;
}

export interface RecipeAdaptationRequest {
  recipe_data: ScrapedRecipeData;
  adaptation: AdaptationRequest;
}

export interface RecipeAdaptationResponse {
  summary: string;
  updated_recipe: ScrapedRecipeData;
}

export const searchRecipesAPI = async (query: string): Promise<RecipeSearchResult[]> => {
    console.log(`[api.ts] Calling searchRecipesAPI with query: ${query}`);
    const response = await apiClient.get<RecipeSearchResult[]>('/recipes/search', {
        params: { query }
    });
    return response.data;
};

export const scrapeRecipeAPI = async (url: string): Promise<ScrapedRecipeData> => {
    const response = await apiClient.post<ScrapedRecipeData>('/recipes/scrape', { url });
    response.data.ingredients = response.data.ingredients ?? [];
    response.data.directions = response.data.directions ?? [];
    return response.data;
};

export const analyzeRecipeAPI = async (data: ScrapedRecipeData): Promise<AnalyzeTaskResponse> => {
    const response = await apiClient.post<AnalyzeTaskResponse>('/recipes/analyze', data);
    return response.data;
};

export const getTaskStatusAPI = async (taskId: string): Promise<TaskStatusResponse> => {
    const response = await apiClient.get<TaskStatusResponse>(`/tasks/${taskId}`);
    return response.data;
};

export const adaptRecipeAPI = async (request: RecipeAdaptationRequest): Promise<RecipeAdaptationResponse> => {
  console.log(`[api.ts] Calling adaptRecipeAPI with type: ${request.adaptation.type}`);
  const response = await apiClient.post<RecipeAdaptationResponse>('/recipes/adapt', request);
  console.log("Respuestita jijijijiji:", response.data)
  return response.data;
};

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface Recipe {
    title: string;
    prep_time?: number | null;
    cook_time?: number | null;
    total_time?: number | null;
    servings?: number | null;
    yield_amount?: string | null;
    ingredients: string;
    directions: string;
    rating?: number | null;
    url: string;
    cuisine_path?: string | null;
    nutrition?: string | null;
    timing?: string | null;
    image_url: string;
    created_at?: string;
    updated_at?: string | null;
}

export interface SearchResultItem {
    id: string;
    score: number;
}

export interface SearchResponse {
    results: SearchResultItem[];
}

export { apiClient };