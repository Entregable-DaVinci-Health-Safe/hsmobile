import AxiosHealth from "../../../Interceptor/AxiosHealth";

export const fetchInstituciones = async (idHc: string) => {
  const response = await AxiosHealth.get(`historiasMedicas/${idHc}/institucionesSalud`);
  return response.data;
};

export const crearInstitucion = async (idHc: string, values: any) => {
  const response = await AxiosHealth.post(`/institucionesSalud`, {
    nombre: values.nombre,
    historiaMedicaId: idHc,
    direccion: {
      direccion: values.direccionCompleta,
      localidad: values.localidadNoVisible,
      provincia: values.provinciaNoVisible,
      barrio: values.barrioNoVisible,
      piso: values.piso,
      departamento: values.dto,
      referencia: values.referencias,
    },
  });
  return response.data.id;
};

export const actualizarInstitucion = async (idInstitucion: string, values: any) => {
  const response = await AxiosHealth.put(`/institucionesSalud/${idInstitucion}`, {
    nombre: values.nombre,
    direccion: {
      direccion: values.direccionCompleta,
      localidad: values.localidadNoVisible,
      provincia: values.provinciaNoVisible,
      barrio: values.barrioNoVisible,
      piso: values.piso,
      departamento: values.departamento,
      referencia: values.otros,
    },
  });
  return response.data;
};

export const manejarContacto = async (idInstitucion: string, contactoData: any, modoEdicion: boolean, contactoId: string | null) => {
  if (!contactoData || (!contactoData.telefono && !contactoData.mailAlternativo)) {
    throw new Error("Debe proporcionar al menos un medio de contacto.");
  }

  if (modoEdicion && contactoId) {
    await AxiosHealth.put(`/institucionesSalud/${idInstitucion}/actualizarContacto/${contactoId}`, contactoData);
  } else {
    await AxiosHealth.post(`/institucionesSalud/${idInstitucion}/nuevoContacto`, contactoData);
  }
};

export const eliminarInstitucion = async (id: string) => {
  const response = await AxiosHealth.put(`/institucionesSalud/${id}/desactivar`);
  return response.data;
};

export const fetchProfesionales = async (idHc: string) => {
  const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/profesionales`);
  return response.data.map((profesional) => ({
    label: profesional.nombre,
    value: profesional.id,
  }));
};

export const vincularProfesionales = async (idInstitucion: string, profesionales: any[]) => {
  const profesionalesIds = profesionales.map((profesional) => profesional.value);
  const response = await AxiosHealth.put(`/institucionesSalud/${idInstitucion}/agregarProfesionales`, {
    profesionalesIds: profesionalesIds, 
  });
  
  
  return response.data;
};

