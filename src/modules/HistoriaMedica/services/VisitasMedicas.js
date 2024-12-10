import AxiosHealth from '../../../Interceptor/AxiosHealth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import firebaseApp from '../../../contextos/firebaseDB';

export const obtenerVisitasMedicas = async (idHc) => {
  try {
    const response = await AxiosHealth.get(`historiasMedicas/${idHc}/visitasMedicas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener visitas médicas:', error);
    throw error;
  }
};

export const desactivarVisitaMedica = async (id) => {
  try {
    await AxiosHealth.put(`visitasMedicas/${id}/desactivar`);
  } catch (error) {
    console.error('Error al desactivar visita médica:', error);
    throw error;
  }
};

export const subirDocumento = async (uriArchivo, tipoDocumento) => {
  try {
    const response = await fetch(uriArchivo);
    const blob = await response.blob();
    const nombreUnico = `Historia_${new Date().getTime()}`;
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `Prescripcion/${nombreUnico}`);
    await uploadBytes(storageRef, blob);
    const urlDescarga = await getDownloadURL(storageRef);
    return urlDescarga.toString();
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    throw error;
  }
};

export const registrarVisitaMedica = async (visitaData) => {
  try {

    const response = await AxiosHealth.post('/visitasMedicas', visitaData);

    return response.data;
  } catch (error) {
    console.error('Error al registrar visita médica:', error);
    throw error;
  }
};

export const editarVisitaMedica = async (idVisita, visitaData) => {

  try {
    await AxiosHealth.put(`/visitasMedicas/${idVisita}`, visitaData);
  } catch (error) {
    console.error('Error al editar visita médica:', error);
    throw error;
  }
};

export const registrarDocumentoVisita = async (tipoDocumento, urlArchivoSubido, visitaMedicaId, indicacionesDescripcion) => {
  try {
    // Validar si el tipo de documento es "NOADJUNTO"
    if (tipoDocumento?.toUpperCase() === "NOADJUNTO") {
      return;
    }

    const presResponse = await AxiosHealth.post(`/prescripciones`, {
      pais: "Argentina",
      visitaMedicaId: visitaMedicaId,
    });


    // Convertir tipoDocumento a mayúsculas
    const tipoDocumentoUpperCase = tipoDocumento?.toUpperCase();

    const tipoURL =
      tipoDocumentoUpperCase === "RECETA"
        ? `/prescripcion/${presResponse.data.id}/crearReceta`
        : tipoDocumentoUpperCase === "ORDEN" || tipoDocumentoUpperCase === "RESULTADO"
        ? `/prescripcion/${presResponse.data.id}/crearEstudio`
        : null;

    
    await AxiosHealth.post(tipoURL, {
      tipo: tipoDocumentoUpperCase,
      url: urlArchivoSubido,
      descripcion: indicacionesDescripcion,
    });

  } catch (error) {
    console.error("Error al registrar el documento de la visita médica:", error.message);
    throw error;
  }
};
