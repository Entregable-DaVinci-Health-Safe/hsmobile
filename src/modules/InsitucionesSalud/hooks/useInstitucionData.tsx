import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchInstituciones, eliminarInstitucion } from '../services/InstitucionService';
import { Alert } from 'react-native';

export const useInstitucionesData = (navigation, route) => {
  const [refreshing, setRefreshing] = useState(false);
  const [buscador, setBuscador] = useState('');
  const [institucionData, setInstitucionData] = useState([]);
  const [loading, setLoadingInstitucion] = useState(true);

  const fetchData = async () => {
    try {
      setLoadingInstitucion(true);
      const idHc = await AsyncStorage.getItem('idHc');
      const data = await fetchInstituciones(idHc);
      setInstitucionData(data);
    } catch (error) {
      console.error('Error al obtener datos de la API', error);
    } finally {
      setLoadingInstitucion(false);
    }
  };

  const handleEliminar = async (id) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Está seguro de que desea eliminar esta institución?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarInstitucion(id);
              Alert.alert('', 'Se eliminó correctamente.');
              fetchData();
            } catch (error) {
              console.error('Error al eliminar la institución:', error);
              Alert.alert('', 'Error al eliminar la institución.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
    navigation.setParams({ EditadoOAgregado: false });
  }, [route.params?.EditadoOAgregado]);

  return {
    refreshing,
    buscador,
    setBuscador,
    institucionData,
    loading,
    handleEliminar,
    onRefresh,
  };
};
