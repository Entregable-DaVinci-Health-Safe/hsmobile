import AsyncStorage from "@react-native-async-storage/async-storage";
import AxiosHealth from "../../Interceptor/AxiosHealth";

export const obtenerIniciales = (nombre, apellido) => {
    const inicialNombre = nombre ? nombre[0] : '';
    const inicialApellido = apellido ? apellido[0] : '';
    return `${inicialNombre}${inicialApellido}`;
};

export const guardarPerfilEnLocalStorage = (perfilDatos) => {
    try {
        const datosSerializados = JSON.stringify(perfilDatos);
        AsyncStorage.setItem('PerfilUsuario', datosSerializados);
    } catch (error) {
        console.error('Error al guardar los datos del perfil:', error);
    }
};

export const obtenerPerfilDeLocalStorage = async () => {
    try {
        const datosSerializados = await AsyncStorage.getItem('PerfilUsuario');
        if (datosSerializados === null) {
            return undefined;
        }
        return JSON.parse(datosSerializados);
    } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
        return undefined;
    }
};


export const cargarPerfilDesdeAPI = async () => {
    try {
        const response = await AxiosHealth.get(`usuarios`);
        eliminarPerfilDeLocalStorage();
        guardarPerfilEnLocalStorage(response.data);
        return response.data;
    } catch (error) {
        console.error('Error al cargar los datos del perfil:', error);
        return undefined;
    }
};


export const eliminarPerfilDeLocalStorage = async () => {
    try {
        await AsyncStorage.removeItem('PerfilUsuario');
    } catch (error) {
        console.error('Error al eliminar los datos del perfil:', error);
    }
};