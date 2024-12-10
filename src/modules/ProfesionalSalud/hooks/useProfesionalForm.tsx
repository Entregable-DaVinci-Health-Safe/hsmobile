import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as yup from "yup";
import {
  fetchEspecialidades,
  fetchCentros,
  crearProfesional,
  actualizarProfesional,
  manejarEspecialidades,
  manejarContacto,
  vincularProfesionalACentro,
} from "../services/ProfesionalService";

export const useProfesionalForm = (profesionalIndex, modoEdicion, valueCentros, setValueCentros, formikRef, navigation) => {
  const [idProfesional, setIdProfesional] = useState(null);
  const [especialidades, setEspecialidades] = useState([]);
  const [centros, setCentros] = useState([]);
  const [alertas, setAlertas] = useState({
    alertaEstaSeguro: false,
    alertaAsignarCentro: false,
    alertaVisible: { alertaBoolean: false, mensaje: "" },
    alertaVisibleError: { alertaBoolean: false, mensaje: "" },
  });

  const tipoMatriculaListado = [
    { label: "MP", value: "Mp" },
    { label: "MN", value: "Mn" },
  ];

  useEffect(() => {
    const initializeForm = async () => {
      setEspecialidades(await fetchEspecialidades());
      const idHc = await AsyncStorage.getItem("idHc");
      setCentros(await fetchCentros(idHc));
    };
    initializeForm();
  }, []);

  const validationSchema = yup.object().shape({
    nombre: yup.string().required("El nombre es requerido"),
    especialidadId: yup.array().min(1, "Seleccione al menos una especialidad"),
    tipoMatriculaId: yup
    .string()
    .required("Seleccione un tipo de matrícula"),
    matricula: yup
    .string()
    .max(4, "La matrícula no puede ser mayor a 4 caracteres")
    .required("El tipo de matrícula es requerido"),
  });

  const handleSubmit = async (values) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
    } catch (error) {
     
    }
    setAlertas({ ...alertas, alertaEstaSeguro: true });
  };

  const handleConfirmSubmit = async (values, setFieldError) => {
    const idHc = await AsyncStorage.getItem("idHc");
  
    try {
      let idProfesional = null;
      if (modoEdicion && profesionalIndex?.id) {
        idProfesional = profesionalIndex.id;
        await actualizarProfesional(idProfesional, values);
      } else {
        idProfesional = await crearProfesional(idHc, values);
      }
  
      setIdProfesional(idProfesional);
      await manejarEspecialidades(
        idProfesional,
        values.especialidadId,
        Array.isArray(profesionalIndex?.especialidades)
          ? profesionalIndex.especialidades.map((e) => e.id)
          : []
      );
        await manejarContacto(
        idProfesional,
        { telefono: values.telefono, mailAlternativo: values.email || null },
        modoEdicion,
        profesionalIndex?.contactos?.[0]?.id || null
      );
  
      setAlertas({ ...alertas, alertaEstaSeguro: false, alertaAsignarCentro: true });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Sucedió un error inesperado";
      if (errorMessage.includes("Ya existe un profesional con la misma matricula")) {
        setFieldError("matricula", "Esta matrícula ya está en uso");
      }
      setAlertas({ ...alertas, alertaEstaSeguro: false, alertaVisibleError: { alertaBoolean: true, mensaje: errorMessage } });
    }
  };

const handleVincular = async () => {
  try {
    
    if (valueCentros && typeof valueCentros === "object" && idProfesional) {

      await vincularProfesionalACentro(valueCentros, idProfesional);

      setAlertas({
        ...alertas,
        alertaEstaSeguro: false,
        alertaAsignarCentro: false,
        alertaVisible: { alertaBoolean: true, mensaje: "¡Creado con éxito!" },
      });
    } else if (!idProfesional) {
      setAlertas({
        ...alertas,
        alertaVisibleError: {
          alertaBoolean: true,
          mensaje: "Debe asegurarse de que el profesional esté creado antes de continuar.",
        },
      });
    } else {
      setAlertas({
        ...alertas,
        alertaVisibleError: {
          alertaBoolean: true,
          mensaje: "Debe seleccionar un único centro.",
        },
      });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Sucedió un error inesperado";
    setAlertas({
      ...alertas,
      alertaVisibleError: {
        alertaBoolean: true,
        mensaje: `Sucedió un error inesperado: ${errorMessage}`,
      },
    });
  }
};

  return {
    idProfesional,
    especialidades,
    centros,
    alertas,
    setAlertas,
    validationSchema,
    handleSubmit,
    handleConfirmSubmit,
    handleVincular,
    tipoMatriculaListado,
  };
};
