import AxiosHealth from '../../../Interceptor/AxiosHealth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchCalendarios = async () => {
  const idHc = await AsyncStorage.getItem('idHc');
  const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/calendarios`);
  return response.data;
};

export const fetchVacunasByRangoEdad = async (rangoEdadId) => {
  const response = await AxiosHealth.get(`/vacunas/byRangoEdad/${rangoEdadId}`);
  return response.data;
};

export const eliminarVacuna = async (calendarioId, rangoEdadId, vacunaAplicadaId) => {

  return await AxiosHealth.delete(`/calendarios/${calendarioId}/vacunas`, {
    data: { rangoEdadId, vacunaAplicadaId },
  });

};

export const registrarVacuna = async (calendarioId, values) => {

  return await AxiosHealth.post(`/calendarios/${calendarioId}/vacunas`, {
    rangoEdadId: values.selectedRangoEdad.value,
    vacunaId: values.selectedVacuna.value,
    fechaAplicada: values.selectedFecha,
    aplicada: "Aplicada",
    numeroDosis: 1,
  });
};

export const activarPersonalSalud = async () => {
  const idHc = await AsyncStorage.getItem('idHc');

  return await AxiosHealth.post(`/historiasMedicas/${idHc}/calendarios/personalSalud`);
};
