import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as yup from 'yup';
import {
  fetchDrogaPrincipalByText,
  crearMedicamentoHabitual,
  actualizarMedicacionHabitual
} from '../services/MedicacionHabitualService';
import { useLoading } from '../../../components/LoadingContext';

export const useMedicacionHabitualForm = (medicacionIndex, modoEdicion) => {
  const [drogasPrincipales, setDrogasPrincipales] = useState([]);
  const [productos, setProductos] = useState([]);
  const { setLoading } = useLoading();
  const [alertas, setAlertas] = useState({
    alertaEstaSeguro: false,
    alertaVisible: { alertaBoolean: false, mensaje: '' },
    alertaVisibleError: { alertaBoolean: false, mensaje: '' },
  });

  const handleSearchDrogaPrincipal = async (searchText) => {
    if (searchText.trim() === "") return;
    if (searchText.length < 2) {
      setDrogasPrincipales([]);
      return;
    }

    try {
      const filteredData = await fetchDrogaPrincipalByText(searchText);
      setDrogasPrincipales(filteredData);
    } catch (error) {
      console.error('Error al buscar las drogas principales:', error);
    }
  };

  const handleSelectDrogaPrincipal = (selectedId) => {
    const selectedDroga = drogasPrincipales.find(droga => droga.id === selectedId);
    if (selectedDroga && selectedDroga.productos) {
      setProductos(selectedDroga.productos); 
    } else {
      setProductos([]); 
    }
  };

  const validationSchema = yup.object().shape({
    drogaPrincipal: yup.string().required('La droga principal es requerida'),
    generico: yup.string().required('El genérico es requerido'),
    comentarios: yup.string(),
  });

  const handleSubmitMedicamento = async (values) => {
    setLoading(true);

    if (modoEdicion) {
      try {
      const medicamentoData = {
        comentarios: values.comentarios,
      }

      await actualizarMedicacionHabitual(medicacionIndex.id, medicamentoData);

      setAlertas({
        ...alertas,
        alertaVisible: { alertaBoolean: true, mensaje: 'Medicamento editado correctamente.' },
      });

      setLoading(false);
      
      return true
    } catch {
      setLoading(false);
    }
    } else {
    try {
      const historiaMedicaId = await AsyncStorage.getItem('idHc'); 

      const medicamentoData = {
        cantidad: 0,
        comentarios: values.comentarios,
        historiaMedicaId: historiaMedicaId,
        medicamentoProductoId: values.generico,
        presentacion: "test" 
      };

      console.log(medicamentoData)
      const response = await crearMedicamentoHabitual(medicamentoData);
      setAlertas({
        ...alertas,
        alertaVisible: { alertaBoolean: true, mensaje: 'Medicamento agregado correctamente.' },
      });

      setLoading(false);

      return response.id; 
    } catch (error) {
      setLoading(false);
      setAlertas({
        ...alertas,
        alertaVisibleError: { alertaBoolean: true, mensaje: `Error al agregar medicamento: ${error.message}` },
      });
      return null;
    }
    }
  };

  return {
    drogasPrincipales,
    productos,
    alertas,
    setAlertas,
    validationSchema,
    handleSubmitMedicamento,
    handleSearchDrogaPrincipal,
    handleSelectDrogaPrincipal,
  };
};
