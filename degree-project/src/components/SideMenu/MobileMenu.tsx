import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../services/api";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}>
        <button onClick={onClose} className={styles.closeButton}>
          &times;
        </button>
        {isAuthenticated && user && (
          <div className={styles.userName}>Hola, {user.email}</div>
        )}
        {isAuthenticated ? (
          <>
            <button
              onClick={() => handleNavigate("/profile")}
              className={styles.menuItem}
            >
              Perfil
            </button>
            <button
              onClick={() => handleNavigate("/history")}
              className={styles.menuItem}
            >
              Historial
            </button>
            <button
              onClick={handleLogoutClick}
              className={`${styles.menuItem} ${styles.logoutButtonMobile}`}
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleNavigate("/login")}
              className={styles.authLinkMobile}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => handleNavigate("/register")}
              className={styles.authLinkMobile}
            >
              Registro
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default MobileMenu;
