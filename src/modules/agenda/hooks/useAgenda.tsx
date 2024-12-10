import { useRef, useState, useCallback, useEffect } from "react";
import AxiosHealth from "../../../Interceptor/AxiosHealth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAgenda = (navigation: any) => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTurnos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idHc = await AsyncStorage.getItem("idHc"); 
      if (!idHc) {
        throw new Error("ID de historia clínica no encontrado");
      }

      const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/turnos`);
      setTurnos(response.data); 
    } catch (error) {
      console.error("Error al obtener los turnos:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreTurno = useCallback(async (id: any) => {
   AxiosHealth.put(`/turnos/${id}/activar`).then(() => {
    fetchTurnos();
  });
  }, []);

  const deleteTurnos = useCallback(async (id: any, idgoogle: any) => {
    setLoading(true);
    try {
      await AxiosHealth.put(`/turnos/${id}/desactivar`);
    } catch (error) {
      console.error("Error al eliminar los turnos:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTurnos(); 
  }, [fetchTurnos]);

  return {
    turnos,
    loading,
    error,
    deleteTurnos,
    restoreTurno,
    refetch: fetchTurnos, 
  };
};
