import { useRef, useState, useCallback, useEffect } from "react";
import AxiosHealth from "../../../Interceptor/AxiosHealth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Yup from "yup";
import { useLoading } from "../../../components/LoadingContext";
export const useAgendaTurnosAgregar = (navigation: any) => {
  const formikRef = useRef(null);
  const [profesionales, setProfesionales] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  
  const { setLoading } = useLoading();

  const [alertas, setAlertas] = useState({
    alertaVisible: false,
    alertaConfig: {
      title: "",
      message: "",
      buttons: [],
    },
  });


  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        setLoading(true);
        const idHc = await AsyncStorage.getItem("idHc");
        if (!idHc) throw new Error("ID de historia clínica no encontrado");

        const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/profesionales`);
        const data = response.data.map((profesional) => ({
          label: profesional.nombre,
          value: profesional.id,
          especialidades: profesional.especialidades || [],
        }));

        data.unshift({
          label: "Agregar Profesional",
          value: "add_profesional",
          icon: "plus",
          color: "#1976d2",
        });

        setProfesionales(data);
      } catch (error) {
        console.error("Error al cargar los profesionales:", error);

        setProfesionales([
          {
            label: "Agregar Profesional",
            value: "add_profesional",
            icon: "plus",
            color: "#1976d2",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfesionales();
  }, []);


  const handleCloseAlerta = () => {
    setAlertas({
      alertaVisible: false, 
      alertaConfig: {
        title: "",
        message: "",
        buttons: [],
      },
    });
  
    
    navigation.navigate("Agenda", {
      EditadoOAgregado: true,
    });
  };
  
  const handleProfesionalChange = useCallback(async (profesionalId: string) => {
    if (profesionalId === "add_profesional") {
      navigation.navigate("Profesionales Salud", {
        screen: "Agregar Profesional",
        params: { modoEdicion: false },
      });
      return;
    }

    try {
      const profesionalSeleccionado = profesionales.find((prof) => prof.value === Number(profesionalId));
      if (profesionalSeleccionado) {
        const especialidadesTransformadas = (profesionalSeleccionado.especialidades || []).map(
          (especialidad) => ({
            label: especialidad.nombre,
            value: especialidad.id,
          })
        );
        setEspecialidades(especialidadesTransformadas);
      } else {
        setEspecialidades([]);
      }

      const response = await AxiosHealth.get(`/profesionales/${profesionalId}/institucionesSalud`);
      const institucionesTransformadas = (response.data || []).map((institucion) => ({
        label: institucion.nombre,
        value: institucion.id,
        direccion: institucion.direccion,
      }));

      institucionesTransformadas.unshift({
        label: "Agregar Institución",
        value: "add_institucion",
        icon: "plus",
        color: "#1976d2",
      });

      setInstituciones(institucionesTransformadas);
    } catch (error) {
      console.error("Error al cargar datos del profesional seleccionado:", error);

      setInstituciones([
        {
          label: "Agregar Institución",
          value: "add_institucion",
          icon: "plus",
          color: "#1976d2",
        },
      ]);
    }
  }, [profesionales]);

  useEffect(() => {
    if (instituciones.length === 0) {
      setInstituciones([
        {
          label: "Agregar Institución",
          value: "add_institucion",
          icon: "plus",
          color: "#1976d2",
        },
      ]);
    }
  }, [instituciones]);

  const validationSchema = {
    fecha: Yup.date().nullable().required("La fecha es obligatoria"),
    hora: Yup.string().required("La hora es obligatoria"),
    motivo: Yup.string().required("El motivo es obligatorio"),
    profesional: Yup.string().nullable().required("Debe seleccionar un profesional"),
    especialidad: Yup.string().nullable().required("Debe seleccionar una especialidad"),
    institucion: Yup.string().nullable().required("Debe seleccionar una institución"),
  };

  return {
    formikRef,
    profesionales,
    especialidades,
    instituciones,
    validationSchema,
    handleProfesionalChange,
    handleCloseAlerta,
    setInstituciones,
    setEspecialidades,
    setLoading,
    alertas,
    setAlertas,
  };
};
