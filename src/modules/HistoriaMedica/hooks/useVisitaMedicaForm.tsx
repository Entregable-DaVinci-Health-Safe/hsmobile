
import { useState, useEffect, useCallback } from 'react';
import * as yup from 'yup';
import {
  obtenerVisitasMedicas,
  desactivarVisitaMedica,
  subirDocumento,
  registrarVisitaMedica,
  editarVisitaMedica,
  registrarDocumentoVisita,
} from '../services/VisitasMedicas';
import AxiosHealth from '../../../Interceptor/AxiosHealth';
import { useNavigation } from '@react-navigation/native';
import { useLoading } from '../../../components/LoadingContext';

export const useVisitasForm = (visita, modoEdicion, hcIdIntegrante) => {
  const navigation = useNavigation();

  
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [indicacionesDescripcion, setIndicacionesDescripcion] = useState('');
  const [uriArchivo, setUriArchivo] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [posicionadoCheck, setPosicionadoCheck] = useState('Receta'); 
  const [atencionVirtual, setAtencionVirtual] = useState(visita?.atencionVirtual || false);
  const [date, setDate] = useState(visita?.fechaVisita ? new Date(visita.fechaVisita) : null);
  const [instituciones, setInstituciones] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const { setLoading } = useLoading();

  const [alertas, setAlertas] = useState({
    alertaVisible: { 
      alertaBoolean: false, 
      successNavigation: false, 
      mensaje: "" 
    },
    alertaVisibleError: { 
      alertaBoolean: false, 
      type: "", 
      mensaje: "" 
    },
  });

  
  const createAddOption = (label, value, icon = 'plus', color = '#1976d2') => ({
    label,
    value,
    icon,
    color,
  });

  
  useEffect(() => {
    const initializeForm = async () => {
      if (!hcIdIntegrante) return; 

      setLoading(true);
      try {
        await fetchProfesionales(hcIdIntegrante);
        await fetchDiagnosticos();
      } catch (error) {
        console.error('Error al inicializar el formulario:', error);
        updateAlert('Error al cargar datos iniciales.', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [hcIdIntegrante]);

  
  const fetchProfesionales = async (idHc) => {
    try {
      const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/profesionales`);
      const data = response.data.map((prof) => ({
        label: prof.nombre,
        value: prof.id,
        especialidades: prof.especialidades || [],
      }));
      data.unshift(createAddOption('Agregar Profesional', 'add_profesional'));
      setProfesionales(data);
    } catch (error) {
      console.error('Error al obtener los profesionales:', error);
      setProfesionales([createAddOption('Agregar Profesional', 'add_profesional')]);
      updateAlert('Error al cargar la lista de profesionales.', 'error');
    }
  };

  
  const fetchDiagnosticos = async () => {
    try {
      const response = await AxiosHealth.get('/diagnosticos/all');
      const data = response.data.map((diag) => ({
        label: diag.nombre,
        value: diag.id,
      }));
      setDiagnosticos(data);
    } catch (error) {
      console.error('Error al cargar diagnósticos:', error);
      updateAlert('Error al cargar la lista de diagnósticos.', 'error');
    }
  };

  
  const handleProfesionalChange = useCallback(
    async (profesionalId) => {
      if (profesionalId === 'add_profesional') {
        navigation.navigate('Profesionales Salud', {
          screen: 'Agregar Profesional',
          params: { modoEdicion: false },
        });
        return;
      }

      try {
        const profesional = profesionales.find((prof) => prof.value === profesionalId);
        
        const especialidadesTransformadas = profesional?.especialidades.map((esp) => ({
          label: esp.nombre,
          value: esp.id,
        })) || [];
        setEspecialidades(especialidadesTransformadas);

        
        const response = await AxiosHealth.get(`/profesionales/${profesionalId}/institucionesSalud`);
        const institucionesTransformadas = (response.data || []).map((inst) => ({
          label: inst.nombre,
          value: inst.id,
        }));

        
        if (institucionesTransformadas.length === 0) {
          institucionesTransformadas.push(createAddOption('Agregar Institución', 'add_institucion'));
        }

        setInstituciones(institucionesTransformadas);
      } catch (error) {
        console.error('Error al cargar datos del profesional:', error);
        
        setInstituciones([createAddOption('Agregar Institución', 'add_institucion')]);
      }
    },
    [profesionales, navigation]
  );

  
  const handleInstitucionChange = (institucionId) => {
    if (institucionId === 'add_institucion') {
      navigation.navigate('Instituciones Salud', {
        screen: 'Agregar Institución',
        params: { modoEdicion: false },
      });
    }
  };

  
  const updateAlert = (mensaje, type, successNavigation = false) => {
    setAlertas((prevAlertas) => ({
      alertaVisible: {
        alertaBoolean: type === 'success',
        mensaje,
        successNavigation,
      },
      alertaVisibleError: {
        alertaBoolean: type !== 'success',
        mensaje,
        type,
      },
    }));
  };

  
  const validationSchema = yup.object().shape({
    fechaVisita: yup.string().required('La fecha de la visita es requerida'),
    atencionVirtual: yup.boolean(),
    profesionalId: yup
      .mixed()
      .required('El profesional es requerido')
      .test('is-valid', 'El profesional debe ser válido', (value) => typeof value === 'string' || typeof value === 'number'),
    institucionId: yup
      .mixed()
      .required('La institución es requerida')
      .test('is-valid', 'La institución debe ser válida', (value) => typeof value === 'string' || typeof value === 'number'),
    especialidadId: yup
      .mixed()
      .required('La especialidad es requerida')
      .test('is-valid', 'La especialidad debe ser válida', (value) => typeof value === 'string' || typeof value === 'number'),
    diagnosticoId: yup
      .mixed()
      .required('El diagnóstico es requerido')
      .test('is-valid', 'El diagnóstico debe ser válido', (value) => typeof value === 'string' || typeof value === 'number'),
    indicaciones: yup.string(),
    tipoDocumento: yup.string().required('El tipo de documento es requerido'),
  });

  
  const handleSubmitForm = async (values, actions) => {
    setLoading(true);
    try {
      if (!hcIdIntegrante) throw new Error('ID de historia clínica no disponible');

      const visitaData = {
        fechaVisita: values.fechaVisita,
        atencionVirtual,
        indicaciones: values.indicaciones,
        institucionSaludId: values.institucionId,
        profesionalId: values.profesionalId,
        especialidadId: values.especialidadId,
        diagnosticoId: values.diagnosticoId,
        historiaMedicaId: hcIdIntegrante,
      };

      let urlArchivoSubido = '';
      if (uriArchivo) {
        urlArchivoSubido = await subirDocumento(uriArchivo, values.tipoDocumento);
      }

      if (modoEdicion && visita?.id) {
        await editarVisitaMedica(visita.id, visitaData);
        if (urlArchivoSubido) {
          await registrarDocumentoVisita(values.tipoDocumento, urlArchivoSubido, visita.id, indicacionesDescripcion);
        }
      } else {
        const nuevaVisita = await registrarVisitaMedica(visitaData);
        if (urlArchivoSubido) {
          await registrarDocumentoVisita(values.tipoDocumento, urlArchivoSubido, nuevaVisita.id, indicacionesDescripcion);
        }
      }

      updateAlert('Operación realizada con éxito.', 'success', true);
      actions.resetForm();
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      updateAlert(`Sucedió un error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    nombreArchivo,
    setNombreArchivo,
    uriArchivo,
    setUriArchivo,
    dialogVisible,
    setDialogVisible,
    posicionadoCheck,
    setPosicionadoCheck,
    atencionVirtual,
    setAtencionVirtual,
    date,
    setDate,
    instituciones,
    setInstituciones,
    profesionales,
    setProfesionales,
    especialidades,
    setEspecialidades,
    diagnosticos,
    alertas,
    setAlertas,
    validationSchema,
    setIndicacionesDescripcion,
    indicacionesDescripcion,
    handleSubmit: handleSubmitForm,
    handleProfesionalChange,
    handleInstitucionChange,
  };
};
