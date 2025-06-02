import { useState, useEffect, useCallback } from 'react';

export interface LocationInfo {
  city: string;
  countryCode: string;
  countryFullName: string;
}

interface IpWhoIsResponse {
  success: boolean;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  message?: string;
}

const DEFAULT_FALLBACK_LOCATION: LocationInfo = {
  city: 'Cochabamba',
  countryCode: 'BO',
  countryFullName: 'Bolivia',
};

const USER_OVERRIDDEN_LOCATION_KEY = 'userOverriddenLocation';

export const useLocation = () => {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOverridden, setIsOverridden] = useState<boolean>(false);
  const [detectedIpLocation, setDetectedIpLocation] = useState<LocationInfo | null>(null);

  const fetchDeviceLocation = useCallback(async (isInitialLoadForLoadingState: boolean) => {
    if (isInitialLoadForLoadingState) setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://ipwho.is/');
      const data: IpWhoIsResponse = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.message || `Error HTTP ${response.status} de ipwho.is`;
        console.error('useLocation: Error fetching IP location -', errorMessage, data);
        throw new Error(errorMessage);
      }

      if (!data.country_code || !data.country) {
        console.warn('useLocation: Respuesta incompleta de ipwho.is (sin código de país o nombre).', data);
        throw new Error('Respuesta incompleta del servicio de geolocalización.');
      }

      let primaryCityOrRegion = data.city;
      if (!primaryCityOrRegion && data.region) {
        primaryCityOrRegion = data.region;
      }
      if (!primaryCityOrRegion) {
        primaryCityOrRegion = data.country;
      }

      const fetchedIpLocation: LocationInfo = {
        city: primaryCityOrRegion || data.country,
        countryCode: data.country_code,
        countryFullName: data.country,
      };
      setDetectedIpLocation(fetchedIpLocation);

      if (!localStorage.getItem(USER_OVERRIDDEN_LOCATION_KEY)) {
        setLocationInfo(fetchedIpLocation);
        setIsOverridden(false);
      }
    } catch (err: any) {
      console.error('useLocation: Fallback due to IP detection error -', err.message || err);
      setDetectedIpLocation(DEFAULT_FALLBACK_LOCATION);
      if (!localStorage.getItem(USER_OVERRIDDEN_LOCATION_KEY)) {
        setError(err.message || 'No se pudo obtener la ubicación. Usando ubicación por defecto.');
        setLocationInfo(DEFAULT_FALLBACK_LOCATION);
        setIsOverridden(false);
      }
    } finally {
      if (isInitialLoadForLoadingState) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadInitialLocation = async () => {
      setIsLoading(true);
      const storedLocationJson = localStorage.getItem(USER_OVERRIDDEN_LOCATION_KEY);

      if (storedLocationJson) {
        try {
          const storedLocation = JSON.parse(storedLocationJson) as LocationInfo;
          if (mounted) {
            setLocationInfo(storedLocation);
            setIsOverridden(true);
            setIsLoading(false);
          }
          await fetchDeviceLocation(false);
        } catch (e) {
          console.error("Failed to parse stored location", e);
          localStorage.removeItem(USER_OVERRIDDEN_LOCATION_KEY);
          if (mounted) await fetchDeviceLocation(true);
        }
      } else {
        if (mounted) await fetchDeviceLocation(true);
      }
    };

    loadInitialLocation();
    return () => { mounted = false; };
  }, [fetchDeviceLocation]);

  const overrideLocation = useCallback((newLocation: LocationInfo) => {
    localStorage.setItem(USER_OVERRIDDEN_LOCATION_KEY, JSON.stringify(newLocation));
    setLocationInfo(newLocation);
    setIsOverridden(true);
    setIsLoading(false);
  }, []);

  const clearOverriddenLocation = useCallback(async () => {
    localStorage.removeItem(USER_OVERRIDDEN_LOCATION_KEY);
    setIsOverridden(false);
    if (detectedIpLocation) {
        setLocationInfo(detectedIpLocation);
        setIsLoading(false);
    } else {
        await fetchDeviceLocation(true);
    }
  }, [detectedIpLocation, fetchDeviceLocation]);

  return {
    locationInfo,
    isLoading,
    error,
    isOverridden,
    detectedIpLocation,
    overrideLocation,
    clearOverriddenLocation,
    refetchLocation: () => fetchDeviceLocation(true),
  };
};
