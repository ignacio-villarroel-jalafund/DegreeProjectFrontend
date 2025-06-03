import React from "react";
import { Link } from "react-router-dom";
import styles from "./SideMenu.module.css";

interface SideMenuProps {
  onLogout: () => void;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ onLogout, onClose }) => {
  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className={styles.menuContainer}>
      <Link to="/profile" className={styles.menuItem} onClick={handleLinkClick}>
        Perfil
      </Link>
      <Link to="/history" className={styles.menuItem} onClick={handleLinkClick}>
        Historial
      </Link>
      <button
        onClick={handleLogoutClick}
        className={`${styles.menuItem} ${styles.logoutButton}`}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default SideMenu;
