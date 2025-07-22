import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTopButton from '../UI/ScrollToTopButton';
import ConfirmationModal from '../Modals/ConfirmationModal';
import styles from './Layout.module.css';

const Layout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
      <ConfirmationModal />
    </div>
  );
};

export default Layout;
