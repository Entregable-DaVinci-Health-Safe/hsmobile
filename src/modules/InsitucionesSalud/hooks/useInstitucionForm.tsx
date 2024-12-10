import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as yup from 'yup';
import {
  fetchInstituciones,
  fetchProfesionales,
  crearInstitucion,
  actualizarInstitucion,
  manejarContacto,
  vincularProfesionales,
} from '../services/InstitucionService';

export const useInstitucionForm = (institucionIndex, modoEdicion) => {
  const [instituciones, setInstituciones] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [alertas, setAlertas] = useState({
    alertaEstaSeguro: false,
    alertaVisible: { alertaBoolean: false, mensaje: '' },
    alertaVisibleError: { alertaBoolean: false, mensaje: '' },
    alertaVincularProfesionales: false,
  });

  useEffect(() => {
    const initializeForm = async () => {
      const idHc = await AsyncStorage.getItem('idHc');
      setInstituciones(await fetchInstituciones(idHc));
      setProfesionales(await fetchProfesionales(idHc));
    };
    initializeForm();
  }, []);

  const reloadProfesionales = async () => {
    const idHc = await AsyncStorage.getItem('idHc');
    const nuevosProfesionales = await fetchProfesionales(idHc);
    setProfesionales(nuevosProfesionales);
  };

  const validationSchema = yup.object().shape({
    nombre: yup.string().required('El nombre es requerido'),
    email: yup.string().email('Ingresa un correo electrónico válido').required('El email es requerido'),
    direccionCompleta: yup.string().required('La dirección es requerida'),
  });

  const handleVincularProfesionales = async (idInstitucion, valueProfesionales) => {
    try {
      const response = await vincularProfesionales(idInstitucion, valueProfesionales);
      return response.data;
    } catch (error) {
      throw new Error('Error al vincular profesionales: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    setAlertas({ ...alertas, alertaEstaSeguro: true });

    const idHc = await AsyncStorage.getItem('idHc');

    try {
      let idInstitucion = null;

      if (modoEdicion && institucionIndex?.id) {
        idInstitucion = institucionIndex.id;
        await actualizarInstitucion(idInstitucion, values);
      } else {
        idInstitucion = await crearInstitucion(idHc, values);
      }

      await manejarContacto(
        idInstitucion,
        {
          telefono: values.telefono,
          mailAlternativo: values.email === '' ? null : values.email,
        },
        modoEdicion,
        institucionIndex?.contactos?.[0]?.id || null
      );

      setAlertas({
        ...alertas,
        alertaEstaSeguro: false,
        alertaVisible: { alertaBoolean: true, mensaje: 'Operación realizada con éxito.' },
      });

      return idInstitucion; 
    } catch (error) {
      setAlertas({
        ...alertas,
        alertaEstaSeguro: false,
        alertaVisibleError: { alertaBoolean: true, mensaje: `Sucedió un error inesperado: ${error.message}` },
      });
      return null;
    }
  };

  return {
    instituciones,
    profesionales,
    alertas,
    setAlertas,
    validationSchema,
    handleSubmit,
    handleVincularProfesionales,
    reloadProfesionales,
  };
};
