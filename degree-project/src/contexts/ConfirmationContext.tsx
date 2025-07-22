import React, { createContext, useState, useCallback, ReactNode } from 'react';

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  url: string | null;
}

interface ConfirmationContextType {
  showConfirmation: (url: string, message?: string) => void;
  hideConfirmation: () => void;
  proceed: () => void;
  confirmationState: ConfirmationState;
}

export const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    isOpen: false,
    message: '',
    url: null,
  });

  const showConfirmation = useCallback((url: string, message: string = 'Estás a punto de salir de la aplicación. ¿Deseas continuar?') => {
    setConfirmationState({ isOpen: true, url, message });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState({ isOpen: false, url: null, message: '' });
  }, []);

  const proceed = useCallback(() => {
    if (confirmationState.url) {
      window.open(confirmationState.url, '_blank', 'noopener,noreferrer');
      hideConfirmation();
    }
  }, [confirmationState.url, hideConfirmation]);

  const value = {
    showConfirmation,
    hideConfirmation,
    proceed,
    confirmationState,
  };

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
    </ConfirmationContext.Provider>
  );
};