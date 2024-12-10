import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AxiosHealth from "../../../Interceptor/AxiosHealth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Configurar Google Signin
GoogleSignin.configure({
  webClientId: "67224328580-2a1nousaluo8fbkqajj4ukp5c8s31ust.apps.googleusercontent.com",
  offlineAccess: true,
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

/**
 * Subir un evento al backend
 */
export const subirEventoBackend = async (evento) => {
  try {
    const response = await AxiosHealth.post("/turnos", evento);
    return response.data; // Devuelve el ID del evento si es necesario
  } catch (error) {
    throw new Error("Error al guardar el evento en el backend");
  }
};

/// Obtener el token de acceso de Google con inicio de sesión forzado
const obtenerGoogleAccessTokenConLogin = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn(); // Forzar inicio de sesión

    const tokens = await GoogleSignin.getTokens();

    return tokens.accessToken; // Devuelve el token de acceso
  } catch (error) {
    console.error("Error al autenticar con Google:", error.message);
    throw new Error("No se pudo autenticar con Google. Verifique su conexión e intente nuevamente.");
  }
};

// Crear un calendario personalizado
const crearCalendarioHS = async (accessToken) => {
  try {
    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars",
      {
        summary: "H&S",
        timeZone: "America/Argentina/Buenos_Aires",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.id; // Devuelve el ID del calendario creado
  } catch (error) {
    console.error("Error al crear el calendario 'H&S':", error.response?.data || error.message);
    throw new Error("No se pudo crear el calendario 'H&S'");
  }
};

// Obtener el ID del calendario "H&S", si no existe, lo crea
const obtenerIdCalendarioHS = async (accessToken) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const calendarioHS = response.data.items.find((cal) => cal.summary === "H&S");
    if (calendarioHS) {
      return calendarioHS.id; // Retorna el ID si ya existe
    }

    // Si no existe, crear el calendario
    return await crearCalendarioHS(accessToken);
  } catch (error) {
    console.error("Error al obtener el ID del calendario 'H&S':", error.response?.data || error.message);
    throw new Error("No se pudo obtener o crear el calendario 'H&S'");
  }
};

// Subir un evento al calendario "H&S"
const subirEventoGoogleCalendar = async (eventDetails) => {
  try {
    const accessToken = await obtenerGoogleAccessTokenConLogin(); // Obtener token de acceso
    const calendarId = await obtenerIdCalendarioHS(accessToken); // Obtener o crear el calendario "H&S"

    // Crear el evento en el calendario "H&S"
    const response = await axios.post(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      eventDetails,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );


    // Retornar el ID del evento creado
    return response.data.id; // Este es el googleId
  } catch (error) {
    console.error("Error al crear evento en el calendario 'H&S':", error.response?.data || error.message);
    throw new Error("No se pudo crear el evento en el calendario 'H&S'");
  }
};

/**
 * Registrar un turno y opcionalmente crear un evento en Google Calendar
 */
export const registrarTurno = async (
  values,
  profesionales,
  especialidades,
  instituciones
) => {
  try {
    const profesionalSeleccionado = profesionales.find(
      (prof) => prof.value === values.profesional
    );
    const especialidadSeleccionada = especialidades.find(
      (esp) => esp.value === values.especialidad
    );
    const institucionSeleccionada = instituciones.find(
      (inst) => inst.value === values.institucion
    );

    if (!profesionalSeleccionado || !especialidadSeleccionada || !institucionSeleccionada) {
      throw new Error("Datos faltantes: profesional, especialidad o institución no encontrados");
    }

    const fecha = new Date(values.fecha);
    if (isNaN(fecha.getTime())) {
      throw new Error("Fecha inválida");
    }

    const formatFechaHora = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");
      const hours = String(fecha.getHours()).padStart(2, "0");
      const minutes = String(fecha.getMinutes()).padStart(2, "0");
      const seconds = String(fecha.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const fechaInicioNormalized = formatFechaHora(fecha);
    const idHc = await AsyncStorage.getItem("idHc");

    let googleEventId = null;

    const startDateTime = fecha.toISOString();
    const endDateTime = new Date(fecha.getTime() + 60 * 60 * 1000).toISOString(); // +1 hora

    if (values.recordatorio) {
      const eventDetails = {
        summary: `Turno Médico: ${values.motivo}`,
        description: `Profesional: ${profesionalSeleccionado.label}, Especialidad: ${especialidadSeleccionada.label}, Institución: ${institucionSeleccionada.label}`,
        start: {
          dateTime: startDateTime,
          timeZone: "America/Argentina/Buenos_Aires",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "America/Argentina/Buenos_Aires",
        },
      };

      googleEventId = await subirEventoGoogleCalendar(eventDetails);
    }


    // Construir el objeto para el backend
    const eventoBackend = {
      fechaInicio: fechaInicioNormalized,
      direccion: `direccion:${institucionSeleccionada.direccion.direccion}?piso:${institucionSeleccionada.direccion.piso}?departamento:${institucionSeleccionada.direccion.departamento}?referencia:${institucionSeleccionada.direccion.referencia}`,
      profesional: `nombre:${profesionalSeleccionado.label}?id:${profesionalSeleccionado.value}`,
      especialidad: `nombre:${especialidadSeleccionada.label}?id:${especialidadSeleccionada.value}`,
      institucion: `nombre:${institucionSeleccionada.label}?id:${institucionSeleccionada.value}`,
      motivo: values.motivo,
      historiaMedicaId: idHc,
      googleId: googleEventId,
    };

    // Subir al backend
    const backendResponse = await subirEventoBackend(eventoBackend);

    return { success: true, backendResponse, googleEventId };
  } catch (error) {
    console.error("Error al registrar el turno:", error.message);
    throw new Error("Error al registrar el turno");
  }
};

const actualizarEventoGoogleCalendar = async (eventId, eventDetails) => {
  try {
    const accessToken = await obtenerGoogleAccessTokenConLogin();
    const calendarId = await obtenerIdCalendarioHS(accessToken);

    const response = await axios.put(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      eventDetails,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.id;
  } catch (error) {
    console.error("Error al actualizar evento en Google Calendar:", error.response?.data || error.message);
    throw new Error("No se pudo actualizar el evento en Google Calendar");
  }
};

export const borrarEventoGoogleCalendar = async (eventId) => {
  try {
    const accessToken = await obtenerGoogleAccessTokenConLogin();
    const calendarId = await obtenerIdCalendarioHS(accessToken);

    console.log(accessToken)
    console.log(calendarId)
    await axios.delete(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

  } catch (error) {
    console.error("Error al eliminar evento de Google Calendar:", error.response?.data || error.message);
    throw new Error("No se pudo eliminar el evento en Google Calendar");
  }
};

export const actualizarTurno = async (
  id,
  values,
  profesionales,
  especialidades,
  instituciones
) => {
  try {
    const profesionalSeleccionado = profesionales.find(
      (prof) => String(prof.value) === String(values.profesional)
    );
    const especialidadSeleccionada = especialidades.find(
      (esp) => String(esp.value) === String(values.especialidad)
    );
    const institucionSeleccionada = instituciones.find(
      (inst) => String(inst.value) === String(values.institucion)
    );

    if (!profesionalSeleccionado || !especialidadSeleccionada || !institucionSeleccionada) {
      throw new Error("Datos faltantes: profesional, especialidad o institución no encontrados");
    }

    const fecha = new Date(values.fecha);
    if (isNaN(fecha.getTime())) {
      throw new Error("Fecha inválida");
    }

    const formatFechaHora = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");
      const hours = String(fecha.getHours()).padStart(2, "0");
      const minutes = String(fecha.getMinutes()).padStart(2, "0");
      const seconds = String(fecha.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const fechaInicioNormalized = formatFechaHora(fecha);

    // Manejo de Google Calendar
    let googleEventId = values.googleId || null;

    if (!values.activo && googleEventId) {
      // Si el turno está desactivado y hay un googleId, eliminamos el evento de Google Calendar
      await borrarEventoGoogleCalendar(googleEventId);
      googleEventId = null; // Establecemos el googleId en null
    } else if (values.activo && !googleEventId) {
      // Si el turno está activo y no tiene un googleId, creamos un nuevo evento
      const startDateTime = fecha.toISOString();
      const endDateTime = new Date(fecha.getTime() + 60 * 60 * 1000).toISOString(); // +1 hora
    
      const eventDetails = {
        summary: `Turno Médico: ${values.motivo}`,
        description: `Profesional: ${profesionalSeleccionado.label}, Especialidad: ${especialidadSeleccionada.label}, Institución: ${institucionSeleccionada.label}`,
        start: {
          dateTime: startDateTime,
          timeZone: "America/Argentina/Buenos_Aires",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "America/Argentina/Buenos_Aires",
        },
      };
    
      googleEventId = await subirEventoGoogleCalendar(eventDetails);
    } else if (values.activo && googleEventId) {
      // Si el turno está activo y tiene un googleId, actualizamos el evento
      const startDateTime = fecha.toISOString();
      const endDateTime = new Date(fecha.getTime() + 60 * 60 * 1000).toISOString(); // +1 hora
    
      const eventDetails = {
        summary: `Turno Médico: ${values.motivo}`,
        description: `Profesional: ${profesionalSeleccionado.label}, Especialidad: ${especialidadSeleccionada.label}, Institución: ${institucionSeleccionada.label}`,
        start: {
          dateTime: startDateTime,
          timeZone: "America/Argentina/Buenos_Aires",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "America/Argentina/Buenos_Aires",
        },
      };
    
      await actualizarEventoGoogleCalendar(googleEventId, eventDetails);
    }

    // Preparar el objeto para el backend
    const eventoBackend = {
      fechaInicio: fechaInicioNormalized,
      direccion: `direccion:${institucionSeleccionada.direccion.direccion}?piso:${institucionSeleccionada.direccion.piso}?departamento:${institucionSeleccionada.direccion.departamento}?referencia:${institucionSeleccionada.direccion.referencia}`,
      profesional: `nombre:${profesionalSeleccionado.label}?id:${profesionalSeleccionado.value}`,
      especialidad: `nombre:${especialidadSeleccionada.label}?id:${especialidadSeleccionada.value}`,
      institucion: `nombre:${institucionSeleccionada.label}?id:${institucionSeleccionada.value}`,
      motivo: values.motivo,
      googleId: googleEventId, // Actualizamos el googleId
      activo: values.activo, // Sincronizamos el estado del turno
    };

    const response = await AxiosHealth.put(`/turnos/${id}`, eventoBackend);
    return { success: true, backendResponse: response.data, googleEventId };
  } catch (error) {
    console.error("Error al actualizar el turno:", error.message);
    throw new Error("Error al actualizar el turno");
  }
};
