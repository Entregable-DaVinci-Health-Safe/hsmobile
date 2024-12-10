import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  obtenerVisitasMedicas,
  desactivarVisitaMedica,
  subirDocumento,
  registrarVisitaMedica,
  editarVisitaMedica,
  registrarDocumentoVisita,
} from '../services/VisitasMedicas';

/**
 * Hook personalizado para manejar las visitas médicas.
 * @param {string} idHc - ID de historia clínica. Opcional.
 * @returns {object} - Estado y funciones relacionadas con las visitas médicas.
 */
export const useVisitasMedicas = (idHcParam) => {
  const [visitasMedicas, setVisitasMedicas] = useState([]);  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (idHc) => {
    setLoading(true);
    try {
      const actualIdHc = idHc || (await AsyncStorage.getItem('idHc'));

      const data = await obtenerVisitasMedicas(actualIdHc);
      setVisitasMedicas(Array.isArray(data) ? data : []); 
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al obtener las visitas médicas. Intente nuevamente más tarde.');
      setVisitasMedicas([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEliminarVisita = useCallback(async (id) => {
    Alert.alert(
      "Confirmar suspensión",
      "¿Está seguro de que desea Suspender esta visita médica?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Suspender",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await desactivarVisitaMedica(id);
              setLoading(false);
              fetchData(idHcParam); 
            } catch (error) {
              setLoading(false);
              console.error("Error al eliminar visita médica:", error);
              setError("Error al eliminar la visita médica. Intente nuevamente.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [fetchData, idHcParam]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(idHcParam).finally(() => {
      setRefreshing(false);
    });
  }, [fetchData, idHcParam]);

  useEffect(() => {
    fetchData(idHcParam);
  }, [fetchData, idHcParam]);

  const manejarVisitaMedica = useCallback(
    async (visitaData, uriArchivo, tipoDocumento, modoEdicion, idVisita) => {
      setLoading(true);
      try {
        let urlArchivoSubido = '';
        if (uriArchivo) {
          urlArchivoSubido = await subirDocumento(uriArchivo, tipoDocumento);
        }

        if (modoEdicion) {
          await editarVisitaMedica(idVisita, visitaData);
          if (urlArchivoSubido) {
            await registrarDocumentoVisita(tipoDocumento, urlArchivoSubido, idVisita);
          }
        } else {
          const nuevaVisita = await registrarVisitaMedica(visitaData);
          if (urlArchivoSubido) {
            await registrarDocumentoVisita(tipoDocumento, urlArchivoSubido, nuevaVisita.id, indicacionesDescripcion);
          }
        }

        fetchData(idHcParam); 
      } catch (error) {
        console.error('Error manejando la visita médica:', error);
        setError('Error al manejar la visita médica. Intente nuevamente.');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, idHcParam]
  );

  return {
    visitasMedicas,
    loading,
    refreshing,
    error,
    handleEliminarVisita,
    manejarVisitaMedica,
    onRefresh,
  };
};
