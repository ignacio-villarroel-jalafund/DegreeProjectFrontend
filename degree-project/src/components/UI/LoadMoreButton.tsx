import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import styles from './LoadMoreButton.module.css';

interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading: boolean;
  onClick: () => void;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ hasMore, isLoading, onClick }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasMore) {
    return null;
  }

  return (
    <div className={styles.buttonContainer}>
      <button onClick={onClick} className={styles.loadMoreButton}>
        Cargar más recetas
      </button>
    </div>
  );
};

export default LoadMoreButton;