import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet, Dimensions, Keyboard, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { PortalProvider, Portal } from '@gorhom/portal';

// Contexto de Loading
interface LoadingContextProps {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

// Componente HeartLoading usando Lottie
const HeartLoading = () => {
  const { loading } = useLoading();

  return (
    <Portal>
      <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true} // Para Android, asegura que el modal se superponga al status bar
      >
        <View style={styles.overlay}>
          <LottieView
            source={require('../assets/heartloader.json')}
            autoPlay
            loop
            style={styles.lottieHeart}
          />
        </View>
      </Modal>
    </Portal>
  );
};

// Proveedor del LoadingContext
export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loading, setLoadingState] = useState(false);

  const setLoading = (isLoading: boolean) => {
    if (isLoading) {
      Keyboard.dismiss(); // Cierra el teclado cuando loading es true
    }
    setLoadingState(isLoading);
  };

  return (
    <PortalProvider>
      <LoadingContext.Provider value={{ loading, setLoading }}>
        {children}
        <HeartLoading />
      </LoadingContext.Provider>
    </PortalProvider>
  );
}

// Hook para usar el contexto de Loading
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Estilos
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Opacidad más alta para asegurar visibilidad
  },
  lottieHeart: {
    width: 150,
    height: 150,
  },
});
