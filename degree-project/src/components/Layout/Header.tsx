import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../contexts/SearchContext";
import SearchForm from "../SearchForm/SearchForm";
import SideMenu from "../SideMenu/SideMenu";
import MobileMenu from "../SideMenu/MobileMenu";
import styles from "./Header.module.css";

import { FiMenu } from "react-icons/fi";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isLoadingSearch, clearSearch } = useSearch();
  const navigate = useNavigate();

  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const desktopMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsDesktopMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearchSubmit = (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 3 || !/[a-zA-Z0-9]/.test(trimmed)) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsMobileMenuOpen(false);
  };

  const toggleDesktopMenu = () => {
    setIsDesktopMenuOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target as Node)
      ) {
        setIsDesktopMenuOpen(false);
      }
    };

    if (isDesktopMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopMenuOpen]);

  const closeAllMenus = () => {
    setIsDesktopMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.mobileControls} onClick={toggleMobileMenu}>
          <FiMenu className={styles.hamburgerIcon} />
        </div>

        <div className={styles.brand}>
          <Link
            to="/"
            onClick={() => {
              clearSearch();
              closeAllMenus();
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

        <div className={`${styles.userSection} ${styles.desktopOnly}`}>
          {isAuthenticated ? (
            <div ref={desktopMenuRef} className={styles.userMenuContainer}>
              <button
                onClick={toggleDesktopMenu}
                className={styles.userInfoButton}
              >
                Hola, {user?.username}
              </button>
              {isDesktopMenuOpen && (
                <SideMenu
                  onLogout={handleLogout}
                  onClose={() => setIsDesktopMenuOpen(false)}
                />
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={styles.authLink}
                onClick={closeAllMenus}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className={styles.authLink}
                onClick={closeAllMenus}
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header;
