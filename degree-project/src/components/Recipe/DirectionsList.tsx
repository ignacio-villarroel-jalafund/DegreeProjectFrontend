import React from 'react';
import styles from './DirectionsList.module.css';

interface DirectionsListProps {
  directions: string[];
  isAdapted: boolean;
}

const DirectionsList: React.FC<DirectionsListProps> = ({ directions, isAdapted }) => {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Instrucciones {isAdapted && <span className={styles.aiBadge}>Adaptado por IA</span>}
      </h2>
       {isAdapted && <p className={styles.warningText}>El contenido está adaptado por IA. Usa tu mejor criterio.</p>}
      <ol className={`${styles.list} ${styles.orderedList}`}>
        {(directions || []).map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </div>
  );
};

export default DirectionsList;