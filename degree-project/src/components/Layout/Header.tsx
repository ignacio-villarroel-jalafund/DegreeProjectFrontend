import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../contexts/SearchContext";
import SearchForm from "../SearchForm/SearchForm";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isLoadingSearch, clearSearch } = useSearch();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 3 || !/[a-zA-Z0-9]/.test(trimmed)) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Link
          to="/"
          onClick={() => {
            clearSearch();
          }}
        >
          Recetas de Cocina
        </Link>
      </div>

      <div className={styles.searchContainer}>
        <SearchForm
          onSearch={handleSearchSubmit}
          isLoading={isLoadingSearch}
        />
      </div>

      <div className={styles.userSection}>
        {isAuthenticated ? (
          <>
            <span className={styles.userInfo}>Hola, {user?.email}</span>
            <button onClick={handleLogout} className={styles.authButton}>
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.authLink}>
              Iniciar Sesión
            </Link>
            <Link to="/register" className={styles.authLink}>
              Registro
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
