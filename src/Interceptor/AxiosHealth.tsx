import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AxiosHealth = axios.create({
  baseURL: 'https://backendvtest-a80d56fb412f.herokuapp.com/api/',
  timeout: 30000,
});

AxiosHealth.interceptors.request.use(
  async (config) => {
    const token = await obtenerToken(); 

    if (token && (config as any).includeAuth !== false) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

AxiosHealth.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function obtenerToken() {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return token;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
}

export default AxiosHealth;
