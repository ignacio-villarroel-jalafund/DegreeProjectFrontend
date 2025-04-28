import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      {new Date().getFullYear()} Recetas de Cocina.
    </footer>
  );
};

export default Footer;