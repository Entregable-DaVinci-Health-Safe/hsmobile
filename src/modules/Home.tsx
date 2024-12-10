import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { Card, Dialog, Button } from "@rneui/themed";
import EntityCard from "../components/EntityCard";
import { useVisitasMedicas } from "./HistoriaMedica/hooks/useVisitaMedica";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAgenda } from "./agenda/hooks/useAgenda";
import { useLoading } from "../components/LoadingContext";
import VisitaRegistroTable from "../components/VisitaRegistroTable";
import { Formik } from "formik";
import * as Yup from "yup";
import InputComponent from "../components/inputs/InputComponent";
import DropdownComponent from "../components/inputs/DropdownComponent";
import DatePickerComponent from "../components/inputs/DatePickerComponent";
import AxiosHealth from "../Interceptor/AxiosHealth";

const Home = ({ route, navigation }) => {
  const { hcIdIntegrante } = route.params || {};
  const { setLoading } = useLoading();
  const { visitasMedicas } = useVisitasMedicas(hcIdIntegrante);
  const { turnos, refetch } = useAgenda(navigation);

  const [lastVisita, setLastVisita] = useState(null); // Última visita médica
  const [nextTurnos, setNextTurnos] = useState([]); // Próximos turnos
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false); // Estado para controlar la visibilidad del diálogo

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log("Iniciando fetchData...");

      const idHc = await AsyncStorage.getItem("idHc");
      console.log("idHc obtenido:", idHc);

      if (idHc === "0") {
        // Mostrar el diálogo si idHc es "0"
        setIsDialogVisible(true);
      }

      // Obtener último registro de visitas médicas
      if (visitasMedicas?.length > 0) {
        const sortedVisitas = [...visitasMedicas].sort(
          (a, b) => new Date(b.fechaVisita).getTime() - new Date(a.fechaVisita).getTime()
        );
        setLastVisita(sortedVisitas[0]);
        console.log("Última Visita:", sortedVisitas[0]);
      } else {
        setLastVisita(null);
      }

      // Validar que los turnos sean un array antes de procesarlos
      console.log("Turnos iniciales:", turnos);
      if (Array.isArray(turnos) && turnos.length > 0) {
        const sortedTurnos = [...turnos].sort(
          (a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio)
        );
        setNextTurnos(sortedTurnos.slice(0, 3)); // Tomar los 3 primeros turnos
      } else {
        console.log("No hay turnos disponibles o la respuesta no es un array.");
        setNextTurnos([]); // Asegurar que se vacíe si no hay turnos
      }
      setLoading(false);
    };

    fetchData();
  }, [visitasMedicas, turnos]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const limpiarCampo = (valor) => {
    if (!valor || typeof valor !== "string") return ""; // Retorna vacío si valor es undefined, null o no es un string
    const sinPregunta = valor.split("?")[0]; // Elimina cualquier texto después de "?"
    const partes = sinPregunta.split(":"); // Divide por ":"
    return partes[partes.length - 1].trim(); // Toma la última parte y elimina espacios
  };

  // Esquema de validación para el formulario del diálogo
  const validationSchema = Yup.object().shape({
    fechaNacimiento: Yup.date()
      .required("La fecha de nacimiento es obligatoria")
      .max(new Date(), "La fecha no puede ser en el futuro"),
    dni: Yup.string()
      .required("El DNI es obligatorio")
      .matches(/^\d+$/, "El DNI debe contener solo números"),
    dniRepeat: Yup.string()
      .required("Debe repetir el DNI")
      .oneOf([Yup.ref("dni"), null], "Los DNIs deben coincidir"),
    genero: Yup.string()
      .required("El género es obligatorio"),
  });

  // Función para manejar la actualización de los datos del usuario
const handleUpdateProfile = async (values) => {
  try {
    setLoading(true);
    console.log(values.fechaNacimiento);
    console.log(values.dni);
    console.log(values.genero);
 
    await AxiosHealth.put("usuarios/googleUpdate", {
      documento: values.dni,
      fechaNacimiento: values.fechaNacimiento,
      genero: values.genero,
    }).then(async () => {
     const response = await AxiosHealth.get("historiasMedicas/usuarios/");

     const nuevoIdHc = response.data.id;
    console.log(response.data.id)
     await AsyncStorage.setItem("idHc", nuevoIdHc.toString());
   
    });

    // Cerrar el diálogo
    setIsDialogVisible(false);

    Alert.alert("Éxito", "Tu perfil ha sido actualizado correctamente.");
    // Opcional: Refrescar los datos
    refetch();
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    Alert.alert("Error", error.response?.data?.message || "No se pudo actualizar el perfil.");
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Próximos Eventos */}
      <Card containerStyle={styles.card}>
        <Card.Title>Próximos Eventos</Card.Title>
        {nextTurnos.length > 0 ? (
          nextTurnos.map((turno) => {
            const motivoLimpio = limpiarCampo(turno.motivo);
            const direccionLimpia = limpiarCampo(turno.direccion);
            const profesionalLimpio = limpiarCampo(turno.profesional);
            const institucionLimpia = limpiarCampo(turno.institucion);
            const especialidadLimpia = limpiarCampo(turno.especialidad);

            return (
              <EntityCard
                key={turno.id}
                agenda={true}
                title={motivoLimpio}
                fecha={new Date(turno.fechaInicio).toLocaleDateString()}
                hora={new Date(turno.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                profesional={profesionalLimpio}
                institucion={institucionLimpia}
                direccion={direccionLimpia}
                comentarios={especialidadLimpia}
                googleCalendar={turno.googleId}
              />
            );
          })
        ) : (
          <Text style={styles.noDataText}>No tiene turnos próximos disponibles.</Text>
        )}
      </Card>

      {/* Última Visita Médica */}
      <Card containerStyle={styles.card}>
        <Card.Title>Última Visita Médica</Card.Title>
        {lastVisita ? (
          <VisitaRegistroTable
            key={lastVisita.id}
            visita={lastVisita}
            onView={() => navigation.navigate("Historia Medica", {
              screen: "VisitaMedicaDetallada",
              params: { visita: lastVisita },
            })}
          />
        ) : (
          <Text style={styles.noDataText}>No tiene visitas médicas registradas.</Text>
        )}
      </Card>

      {/* Diálogo para Completar Datos de Perfil */}
      <Dialog isVisible={isDialogVisible}>
        <ScrollView>
          <Text style={styles.dialogTitle}>Completa tu Perfil</Text>
          <Formik
            initialValues={{
              fechaNacimiento: "",
              dni: "",
              dniRepeat: "",
              genero: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleUpdateProfile}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View>
                {/* Fecha de Nacimiento */}
                <DatePickerComponent
                        date={values.fechaNacimiento}
                        setDate={(date) => setFieldValue('fechaNacimiento', date)}
                        formatDate={(date) => date.toLocaleDateString()}
                        placeholder="Fecha de Nacimiento"
                        needsTime={false}
                        errorMessage={touched.fechaNacimiento && errors.fechaNacimiento}
                      />

                {/* DNI */}
                <InputComponent
                  placeholder="DNI"
                  value={values.dni}
                  onChangeText={handleChange('dni')}
                  onBlur={handleBlur('dni')}
                  errorMessage={touched.dni && errors.dni ? errors.dni : ""}
                  keyboardType="numeric"
                  containerStyle={styles.formElement}
                />

                {/* Repetir DNI */}
                <InputComponent
                  placeholder="Repetir DNI"
                  value={values.dniRepeat}
                  onChangeText={handleChange('dniRepeat')}
                  onBlur={handleBlur('dniRepeat')}
                  errorMessage={touched.dniRepeat && errors.dniRepeat ? errors.dniRepeat : ""}
                  keyboardType="numeric"
                  containerStyle={styles.formElement}
                />

                {/* Género */}
                <DropdownComponent
                  data={[
                    { label: "Masculino", value: "MASCULINO" },
                    { label: "Femenino", value: "FEMENINO" },
                  ]}
                  selectedValue={values.genero ? { label: values.genero, value: values.genero } : null}
                  setSelectedValue={(item) => setFieldValue("genero", item ? item.value : "")}
                  placeholder="Seleccione su género"
                  errorMessage={touched.genero && errors.genero ? errors.genero : ""}
                  containerStyle={styles.formElement}
                />

                {/* Botones de Acción */}
                <View style={styles.dialogButtonContainer}>
                  <Button
                    title="Guardar"
                    onPress={handleSubmit}
                    buttonStyle={styles.saveButton}
                  />
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </Dialog>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  card: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  noDataText: {
    textAlign: "center",
    color: "gray",
    marginVertical: 10,
    fontSize: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  dialogButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: "#2196F3",
    fontSize: 16,
  },
  formElement: {
    marginVertical: 5,
  },
});

export default Home;
