import React, { useState, type FormEvent } from 'react';
import styles from './SearchForm.module.css';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm}>
      <input
        type="search"
        placeholder="Buscar recetas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
        disabled={isLoading}
      />
      <button type="submit" className={styles.searchButton} disabled={isLoading}>
        {isLoading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
};

export default SearchForm;