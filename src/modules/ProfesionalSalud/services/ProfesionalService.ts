import AxiosHealth from "../../../Interceptor/AxiosHealth";

export const fetchEspecialidades = async () => {
  try {
    const response = await AxiosHealth.get('/especialidades/all');
    return response.data.map((especialidad) => ({
      label: especialidad.nombre,
      value: especialidad.id,
    }));
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    throw error;
  }
};

export const fetchCentros = async (idHc: string) => {
  try {
    const response = await AxiosHealth.get(`historiasMedicas/${idHc}/institucionesSalud`);
    return response.data.map((centro) => ({
      label: centro.nombre,
      value: centro.id,
    }));
  } catch (error) {
    console.error('Error al obtener centros:', error);
    throw error;
  }
};

export const crearProfesional = async (idHc: string, values: any) => {
  try {
    if (!values.nombre || !values.tipoMatricula || !values.matricula) {
      throw new Error("Todos los campos obligatorios deben estar completos.");
    }

    const response = await AxiosHealth.post(`/profesionales`, {
      nombre: values.nombre,
      tipoMatricula: values.tipoMatricula,
      matricula: values.matricula,
      idHistoriaMedica: idHc,
    });

    return response.data.id;
  } catch (error) {
    console.error('Error al crear profesional:', error);
    throw error;
  }
};

export const manejarEspecialidades = async (idProfesional: string, especialidadesSeleccionadas: any[], especialidadesOriginales: number[]) => {
  try {
    if (!especialidadesSeleccionadas || especialidadesSeleccionadas.length === 0) {
      throw new Error("Debe seleccionar al menos una especialidad.");
    }

    
    const especialidadesIds = especialidadesSeleccionadas.map((item) => item.value);

    
    const especialidadesEliminadas = especialidadesOriginales.filter(
      (id) => !especialidadesIds.includes(id)
    );

    
    if (especialidadesEliminadas.length > 0) {
      await AxiosHealth.put(`/profesionales/${idProfesional}/removerEspecialidades`, { especialidadesIds: especialidadesEliminadas });
    }

    
    await AxiosHealth.put(`/profesionales/${idProfesional}/agregarEspecialidades`, { especialidadesIds });
  } catch (error) {
    console.error("Error al manejar especialidades:", error);
    throw error;
  }
};

export const vincularProfesionalACentro = async (idCentro: string, idProfesional: string) => {
  try {
    const response = await AxiosHealth.put(`/institucionesSalud/${idCentro.value}/agregarProfesional/${idProfesional}`);
    return response.data;
  } catch (error) {
    console.error('Error al vincular profesional a centro:', error);
    throw error;
  }
};

export const manejarContacto = async (idProfesional: string, contactoData: any, modoEdicion: boolean, contactoId: string | null) => {
  try {
    if (!contactoData || (!contactoData.telefono && !contactoData.mailAlternativo)) {
      throw new Error("Debe proporcionar al menos un medio de contacto.");
    }

    if (modoEdicion && !contactoId) {
      throw new Error("No se puede actualizar el contacto sin un ID de contacto válido.");
    }

    if (modoEdicion && contactoId) {
      await AxiosHealth.put(`/profesionales/${idProfesional}/actualizarContacto/${contactoId}`, contactoData);
    } else {
      await AxiosHealth.post(`/profesionales/${idProfesional}/nuevoContacto`, contactoData);
    }
  } catch (error) {
    console.error('Error al manejar contacto:', error);
    throw error;
  }
};


export const getProfesionales = async (idHc: string) => {
  try {
    const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/profesionales`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los profesionales:", error);
    throw error;
  }
};


export const eliminarProfesional = async (id: string) => {
  try {
    const response = await AxiosHealth.put(`/profesionales/${id}/desactivar`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el profesional:", error);
    throw error;
  }
};


export const agregarProfesional = async (profesionalData: any) => {
  try {
    const response = await AxiosHealth.post(`/profesionales`, profesionalData);
    return response.data;
  } catch (error) {
    console.error("Error al agregar el profesional:", error);
    throw error;
  }
};


export const actualizarProfesional = async (id: string, profesionalData: any) => {
  try {
    const response = await AxiosHealth.put(`/profesionales/${id}`, profesionalData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el profesional:", error);
    throw error;
  }
};
