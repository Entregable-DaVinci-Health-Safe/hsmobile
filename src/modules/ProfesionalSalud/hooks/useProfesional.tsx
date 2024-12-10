import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfesionales, eliminarProfesional } from '../services/ProfesionalService';

export const useProfesional = () => {
  const [loading, setLoading] = useState(true);
  const [profesionales, setProfesionales] = useState([]);
  const [idHc, setIdHc] = useState<string | null>(null);

  const fetchProfesionales = async (idHc: string) => {
    try {
      setLoading(true);
      const data = await getProfesionales(idHc);
      setProfesionales(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarProfesional = async (id: string) => {
    if (!idHc) return;
    Alert.alert(
      "Confirmar Eliminación",
      "¿Está seguro de que desea eliminar este profesional?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarProfesional(id);
              await fetchProfesionales(idHc);
            } catch (error) {
              console.error("Error al eliminar profesional:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    const fetchIdHc = async () => {
      try {
        const storedIdHc = await AsyncStorage.getItem('idHc');
        if (storedIdHc) {
          setIdHc(storedIdHc);
          await fetchProfesionales(storedIdHc);
        }
      } catch (error) {
        console.error("Error fetching idHc from AsyncStorage:", error);
      }
    };
    fetchIdHc();
  }, []);

  return { 
    loading, 
    profesionales, 
    handleEliminarProfesional, 
    fetchData: () => idHc ? fetchProfesionales(idHc) : null, 
  };
};
