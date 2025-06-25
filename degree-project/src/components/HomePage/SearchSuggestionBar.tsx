import React from 'react';
import styles from './SearchSuggestionBar.module.css';

type ActiveButtonType = "local" | "nacional" | "popular";

interface SearchSuggestionBarProps {
  activeButton: ActiveButtonType;
  onButtonClick: (buttonType: ActiveButtonType) => void;
  isLoading: boolean;
  hasLocation: boolean;
}

const SearchSuggestionBar: React.FC<SearchSuggestionBarProps> = ({
  activeButton,
  onButtonClick,
  isLoading,
  hasLocation,
}) => {
  const buttons: { key: ActiveButtonType; label: string, disabled?: boolean }[] = [
    { key: 'local', label: 'Recetas Locales', disabled: !hasLocation },
    { key: 'nacional', label: 'Recetas Nacionales', disabled: !hasLocation },
    { key: 'popular', label: 'Recetas Internacionales' },
  ];

  return (
    <div className={styles.suggestionButtons}>
      {buttons.map(({ key, label, disabled }) => (
        <button
          key={key}
          onClick={() => onButtonClick(key)}
          className={`${styles.suggestionButton} ${activeButton === key ? styles.active : ""}`}
          disabled={isLoading || disabled}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestionBar;