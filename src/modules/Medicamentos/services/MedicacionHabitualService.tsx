import AxiosHealth from "../../../Interceptor/AxiosHealth";

export const fetchDrogaPrincipalByText = async (searchText) => {
    try {
      const response = await AxiosHealth.get(`medicamentos/all/${searchText}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener las drogas principales:', error);
      return [];
    }
  };

export const fetchDrogaPrincipal = async () => {
  try {
    const response = await AxiosHealth.get('medicamentos/all');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las drogas principales:', error);
    return [];
  }
};

export const crearMedicamentoHabitual = async (medicamentoData) => {
    try {
      const response = await AxiosHealth.post(`historiasMedicas/agregarMedicamentos`, medicamentoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el medicamento:', error);
      throw error;
    }
  };

export const actualizarMedicacionHabitual = async (idMedicacion, values) => {
  try {
    await AxiosHealth.put(`historiasMedicas/actualizarMedicamentos/${idMedicacion}`, values);
  } catch (error) {
    console.error('Error al actualizar la medicación:', error);
    throw error;
  }
};

export const manejarComentarios = async (idMedicacion, data, modoEdicion, idComentario) => {
  try {
    if (modoEdicion && idComentario) {
      await AxiosHealth.put(`medicacion/${idMedicacion}/comentarios/${idComentario}`, data);
    } else {
      await AxiosHealth.post(`medicacion/${idMedicacion}/comentarios`, data);
    }
  } catch (error) {
    console.error('Error al manejar los comentarios:', error);
    throw error;
  }
};
