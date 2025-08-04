import React, { useState } from 'react';
import { getSubdivisionsAPI } from '../../services/api';
import { useLocation } from '../../hooks/useLocation';
import LoadingSpinner from '../UI/LoadingSpinner';
import styles from './LocationDisplay.module.css';
import { FiChevronDown } from 'react-icons/fi';

interface LocationDisplayProps {
  locationHook: ReturnType<typeof useLocation>;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ locationHook }) => {
  const {
    locationInfo: activeLocation,
    isLoading: isLoadingLocation,
    error: locationError,
    isOverridden,
    detectedIpLocation,
    overrideLocation,
    clearOverriddenLocation,
  } = locationHook;

  const [showCorrection, setShowCorrection] = useState(false);
  const [subdivisions, setSubdivisions] = useState<string[]>([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  const handleOpenCorrection = async () => {
    if (!activeLocation?.countryCode) return;
    setShowCorrection(true);
    setIsLoadingSubs(true);
    setCorrectionError(null);
    try {
      const data = await getSubdivisionsAPI(activeLocation.countryCode);
      setSubdivisions(data.subdivisions || []);
      if (data.subdivisions.includes(activeLocation.city)) {
        setSelectedSub(activeLocation.city);
      } else if (data.subdivisions.length > 0) {
        setSelectedSub(data.subdivisions[0]);
      }
    } catch (err: any) {
      setCorrectionError(err.response?.data?.detail || "Error al cargar regiones.");
    } finally {
      setIsLoadingSubs(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!selectedSub || !activeLocation) return;
    overrideLocation({ ...activeLocation, city: selectedSub });
    setShowCorrection(false);
  };

  if (isLoadingLocation) {
    return null;
  }

  if (locationError && !activeLocation) {
    return (
        <div className={styles.locationInfoArea}>
            <p className={styles.errorTextSmall}>Error al detectar ubicación: {locationError}.</p>
        </div>
    );
  }

  if (!activeLocation) return null;


  if (showCorrection) {
    return (
      <div className={styles.locationCorrectionUI}>
        <h4>Corregir ubicación para {activeLocation.countryFullName}</h4>
        {isLoadingSubs ? <LoadingSpinner /> : (
          <div className={styles.selectContainer}>
            <div className={styles.selectWrapper}>
                <select
                    value={selectedSub}
                    onChange={(e) => setSelectedSub(e.target.value)}
                    className={styles.subdivisionSelect}
                >
                    {subdivisions.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
                <FiChevronDown className={styles.selectArrowIcon} />
            </div>
            <button onClick={handleConfirmLocation} className={styles.confirmButton} disabled={!selectedSub}>
              Actualizar
            </button>
          </div>
        )}
        {correctionError && <p className={styles.errorTextSmall}>{correctionError}</p>}
        <button onClick={() => setShowCorrection(false)} className={styles.cancelButton}>
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.locationInfoArea}>
        <div className={styles.locationText}>
            Ubicación: <span>{activeLocation.city}, {activeLocation.countryFullName}</span>
            <button onClick={handleOpenCorrection} className={styles.linkButton}>
                ¿No es correcto?
            </button>
        </div>
        {isOverridden && detectedIpLocation && (
            <div className={styles.detectedLocationInfo}>
                (Detectada: {detectedIpLocation.city})
                <button onClick={clearOverriddenLocation} className={`${styles.linkButton} ${styles.resetButton}`}>
                    Usar detectada
                </button>
            </div>
        )}
    </div>
  );
};

export default LocationDisplay;