import { useState, useCallback, useRef } from 'react';
import { recipeService } from '../services/recipe.service';
import { useLocation } from './useLocation';
import { SupermarketInfo as SupermarketInfoType } from '../services/api';

export type IngredientMenuState = { index: number; name: string; x: number; y: number } | null;
export type IngredientPreviewState = { name: string; imageUrl: string | null; searchUrl: string | null; found: boolean; message?: string } | null;
export type SupermarketModalState = { isOpen: boolean; ingredientName: string | null; results: SupermarketInfoType[] | null; isLoading: boolean; error: string | null; nextPageToken: string | null; };

export const useIngredientInteraction = () => {
    const { locationInfo, isLoading: isLoadingLocation, error: locationError } = useLocation();
    
    const [ingredientMenu, setIngredientMenu] = useState<IngredientMenuState>(null);
    const [preview, setPreview] = useState<IngredientPreviewState>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [supermarketModal, setSupermarketModal] = useState<SupermarketModalState>({ isOpen: false, ingredientName: null, results: null, isLoading: false, error: null, nextPageToken: null });

    const menuRef = useRef<HTMLDivElement>(null);

    const handleSearchOnline = useCallback(async (ingredientName: string) => {
        setIngredientMenu(null);
        setIsPreviewLoading(true);
        setPreview({ name: ingredientName, imageUrl: null, searchUrl: null, found: false});
        try {
            const data = await recipeService.getIngredientInfo(ingredientName);
            if (data && data.name?.trim()) {
                setPreview({ name: data.name, imageUrl: data.image_url, searchUrl: data.search_url, found: true });
            } else {
                setPreview({ name: ingredientName, imageUrl: null, searchUrl: null, found: false, message: "No se encontraron resultados." });
            }
        } catch (error) {
            setPreview({ name: ingredientName, imageUrl: null, searchUrl: null, found: false, message: "Error al buscar el ingrediente." });
        } finally {
            setIsPreviewLoading(false);
        }
    }, []);

    const handleFindSupermarkets = useCallback(async (ingredientName: string) => {
        setIngredientMenu(null);
        if (isLoadingLocation) return;
        if (locationError || !locationInfo) {
            setSupermarketModal({ isOpen: true, ingredientName, results: null, isLoading: false, error: `No se pudo obtener tu ubicación: ${locationError || 'Revisa permisos.'}`, nextPageToken: null });
            return;
        }

        setSupermarketModal({ isOpen: true, ingredientName, results: [], isLoading: true, error: null, nextPageToken: null });
        try {
            const data = await recipeService.findSupermarkets(locationInfo.city, locationInfo.countryFullName);
            setSupermarketModal(prev => ({ ...prev, isLoading: false, results: data.supermarkets, nextPageToken: data.next_page_token || null, error: data.supermarkets.length === 0 ? "No se encontraron supermercados." : null }));
        } catch (err: any) {
             const errorMsg = err.response?.data?.detail || "Error al buscar supermercados.";
            setSupermarketModal(prev => ({ ...prev, isLoading: false, error: errorMsg }));
        }
    }, [locationInfo, isLoadingLocation, locationError]);
    
    const handleLoadMoreSupermarkets = useCallback(async () => {
        if (!supermarketModal.nextPageToken || supermarketModal.isLoading || !locationInfo) return;

        setSupermarketModal(prev => ({...prev, isLoading: true}));
        try {
            const data = await recipeService.findSupermarkets(locationInfo.city, locationInfo.countryFullName, supermarketModal.nextPageToken);
            setSupermarketModal(prev => ({
                ...prev,
                isLoading: false,
                results: prev.results ? [...prev.results, ...data.supermarkets] : data.supermarkets,
                nextPageToken: data.next_page_token || null
            }));
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || "Error al cargar más supermercados.";
            setSupermarketModal(prev => ({...prev, isLoading: false, error: errorMsg}));
        }
    }, [supermarketModal.nextPageToken, supermarketModal.isLoading, locationInfo]);

    const closeAllModals = () => {
        setIngredientMenu(null);
        setPreview(null);
        setSupermarketModal(prev => ({ ...prev, isOpen: false }));
    };

    return {
        ingredientMenu, setIngredientMenu,
        preview, setPreview,
        isPreviewLoading,
        supermarketModal, setSupermarketModal,
        menuRef,
        handleSearchOnline,
        handleFindSupermarkets,
        handleLoadMoreSupermarkets,
        closeAllModals,
        isLoadingLocation
    };
};