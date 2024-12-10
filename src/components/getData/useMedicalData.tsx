import { useState, useCallback } from 'react';
import AxiosHealth from '../../Interceptor/AxiosHealth';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useMedicalData = () => {
    const [data, setData] = useState({
        profesionales: [],
        diagnosticos: [],
        noExisteProfesionales: false,
    });

    const fetchData = useCallback(async () => {
        const idHc = await AsyncStorage.getItem("idHc");
        const response = await AxiosHealth.get(`/historiasMedicas/${idHc}`);
        setData({
            ...data,
            profesionales: response.data.profesionales,
            diagnosticos: response.data.diagnosticos,
            noExisteProfesionales: response.data.profesionales.length === 0
        });
    }, []);

    return { ...data, fetchData };
};
