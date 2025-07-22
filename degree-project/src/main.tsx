import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { SearchProvider } from './contexts/SearchContext.tsx';
import { FavoritesProvider } from './contexts/FavoriteContext.tsx';
import { ConfirmationProvider } from './contexts/ConfirmationContext.tsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <SearchProvider>
            <ConfirmationProvider>
              <App />
            </ConfirmationProvider>
          </SearchProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);