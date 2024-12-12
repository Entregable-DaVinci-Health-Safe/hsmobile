import { useState, useEffect, useReducer } from 'react';
import AxiosHealth from '../../../Interceptor/AxiosHealth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const useMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reducerValue, forceUpdate] = useReducer(x => x + 1, 0);

  const deleteMedicamento = async (medicamentoID) => {
    Alert.alert(
      'Confirmación',
      '¿Está seguro de que desea eliminar este medicamento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await AxiosHealth.delete(`/historiasMedicas/eliminarMedicamentos/${medicamentoID}`);
              forceUpdate();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el medicamento. Inténtalo de nuevo.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  
  const fetchMedicamentos = async () => {
    try {
      setLoading(false);
      const idHc = await AsyncStorage.getItem('idHc'); 
      if (!idHc) {
        throw new Error('idHc no encontrado');
      }
      const response = await AxiosHealth.get(`historiasMedicas/${idHc}/medicamentos`);
      console.log(response.data);
      setMedicamentos(response.data);
    } catch (err) {
      console.error('Error al obtener medicamentos:', err);
      setMedicamentos([])
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicamentos();  
  }, [reducerValue]);

  return { medicamentos, deleteMedicamento, loading, error, forceUpdate };
};

export default useMedicamentos;
