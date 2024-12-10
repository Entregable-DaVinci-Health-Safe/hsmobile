import { useState, useEffect } from 'react';
import {
  fetchCalendarios,
  fetchVacunasByRangoEdad,
  eliminarVacuna,
  registrarVacuna,
  activarPersonalSalud
} from '../services/VacunasServices';
import { Alert } from 'react-native';

export const useVacunas = () => {
  const [calendarios, setCalendarios] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [selectedVacunas, setSelectedVacunas] = useState([]);
  const [selectedCalendario, setSelectedCalendario] = useState(null);
  const [selectedRangoEdad, setSelectedRangoEdad] = useState(null); 
  const [switchEsProfesional, setSwitchEsProfesional] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfirmed, setAlertConfirmed] = useState(false);
  const [modalRegistrar, setOpenModalRegistrar] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Función para cargar calendarios, utilizada tanto en el efecto inicial como en recargas
  const recargarCalendarios = async () => {
    try {
      const data = await fetchCalendarios();
      setCalendarios(data);

      const personalSaludCalendario = data.find(cal => cal.tipo === 'PERSONAL_SALUD');
      if (personalSaludCalendario) {
        setSwitchEsProfesional(true);
        setAlertConfirmed(true);
      }
    } catch (error) {
      console.error('Error fetching calendarios:', error);
    }
  };

  // Cargar calendarios al montar el hook
  useEffect(() => {
    recargarCalendarios();
  }, []);

  const handleSelectCalendario = (calendarioId) => {
    setSelectedCalendario(calendarioId);
    setSelectedRangoEdad(null); // Limpiar el rango de edad seleccionado
    setVacunas([]); // Limpiar las vacunas al cambiar de calendario
  };

  const handleSelectRangoEdad = async (rangoEdadId) => {
    setSelectedRangoEdad(rangoEdadId);
    try {
      const vacunasAplicables = await fetchVacunasByRangoEdad(rangoEdadId.value); // Asegúrate de pasar el valor correcto
      setVacunas(vacunasAplicables);
    } catch (error) {
      console.error('Error fetching vacunas:', error);
    }
  };

  const handleSelectVacuna = (id) => {
    setSelectedVacunas((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((v) => v !== id) : [...prevSelected, id]
    );
  };

  const handleCheckProfesional = () => {
    if (!alertConfirmed) {
      setShowAlert(true);
    }
  };

  const handleAlertConfirm = async () => {
    try {
      await activarPersonalSalud();
      setSwitchEsProfesional(true);
      setAlertConfirmed(true);
      setShowAlert(false);
    } catch (error) {
      console.error('Error activando personal de salud:', error);
      Alert.alert('Error', 'No se pudo activar el personal de salud. Por favor, intenta nuevamente.');
    }
  };

  return {
    calendarios,
    vacunas,
    selectedVacunas,
    selectedCalendario,
    selectedRangoEdad,
    switchEsProfesional,
    showAlert,
    setShowAlert,
    alertConfirmed,
    modalRegistrar,
    date,
    showDatePicker,
    setSelectedCalendario: handleSelectCalendario,
    handleSelectRangoEdad,
    handleSelectVacuna,
    handleCheckProfesional,
    handleAlertConfirm,
    setOpenModalRegistrar,
    setDate,
    setShowDatePicker,
    eliminarVacuna,
    registrarVacuna,
    recargarCalendarios, // Exponer recargarCalendarios
  };
};
