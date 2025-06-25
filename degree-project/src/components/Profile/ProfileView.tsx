import React from 'react';
import { User } from '../../services/api';
import styles from './ProfileView.module.css';

interface ProfileViewProps {
  user: User;
}

const formatDate = (dateInput: Date | string | undefined): string => {
    if (!dateInput) return "No disponible";
    const dateObj = new Date(dateInput);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
};

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  return (
    <div className={styles.profileDetails}>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Nombre de Usuario:</span>
        <span className={styles.detailValue}>{user.username}</span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Correo Electrónico:</span>
        <span className={styles.detailValue}>{user.email}</span>
      </div>
      <div className={styles.detailItem}>
        <span className={styles.detailLabel}>Usuario desde:</span>
        <span className={styles.detailValue}>{formatDate(user.created_at)}</span>
      </div>
    </div>
  );
};

export default ProfileView;