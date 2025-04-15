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

const SEARCH_API_BASE_URL = import.meta.env.VITE_SEARCH_API_BASE_URL || 'http://localhost:8080/api/v1';

const searchApiClient = axios.create({
    baseURL: SEARCH_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

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
    id: string;
    recipe_name: string;
    prep_time?: number | null;
    cook_time?: number | null;
    total_time?: number | null;
    servings?: number | null;
    yield_amount?: string | null;
    ingredients: string;
    directions: string;
    rating?: number | null;
    url?: string | null;
    cuisine_path?: string | null;
    nutrition?: string | null;
    timing?: string | null;
    img_src?: string | null;
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

export { apiClient, searchApiClient };