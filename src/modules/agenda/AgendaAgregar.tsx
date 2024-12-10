import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Switch } from "react-native";
import { Text, Button } from "@rneui/themed";
import { Formik } from "formik";
import * as Yup from "yup";

import DatePickerComponent from "../../components/inputs/DatePickerComponent";
import InputComponent from "../../components/inputs/InputComponent";
import DropdownComponent from "../../components/inputs/DropdownComponent";
import AlertCustom from "../../components/AlertCustom";
import { registrarTurno, actualizarTurno } from "./services/useAgendaTurnosServices";
import { useAgendaTurnosAgregar } from "./hooks/useAgendaAgregar";
import ButtonHealth from "../../components/ButtonHealth";

const validationSchema = Yup.object().shape({
  fecha: Yup.date().nullable().required("La fecha es obligatoria"),
  motivo: Yup.string().required("El motivo es obligatorio"),
  profesional: Yup.string().required("Debe seleccionar un profesional"),
  especialidad: Yup.string().required("Debe seleccionar una especialidad"),
  institucion: Yup.string().required("Debe seleccionar una institución"),
});

const AgendaTurnosAgregar = ({ route, navigation }) => {
  const { modoEdicion = false, turno = {} } = route.params || {};

  const {
    formikRef,
    profesionales,
    especialidades,
    instituciones,
    alertas,
    setAlertas,
    setLoading,
    handleCloseAlerta,
    handleProfesionalChange,
  } = useAgendaTurnosAgregar(navigation);

  const extraerValor = (valor) => {
    if (!valor) return "";
    const match = valor.match(/id:(\d+)/);
    if (match) return match[1];
    const sinPregunta = valor.split("?")[0];
    const partes = sinPregunta.split("nombre:");
    return partes.length > 1 ? partes[1].trim() : sinPregunta.trim();
  };

  const initialValues = modoEdicion && turno
  ? {
      fecha: turno.fechaInicio ? new Date(turno.fechaInicio) : null,
      motivo: turno.motivo || "",
      profesional: turno.profesional ? extraerValor(turno.profesional) : "",
      especialidad: turno.especialidad ? extraerValor(turno.especialidad) : "",
      institucion: turno.institucion ? extraerValor(turno.institucion) : "",
      recordatorio: !!turno.googleId, 
      activo: !!turno.googleId, 
      googleId: turno.googleId || null, 
    }
  : {
      fecha: null,
      motivo: "",
      profesional: "",
      especialidad: "",
      institucion: "",
      recordatorio: false,
      activo: false, 
      googleId: null, 
    };

    const handleSubmitForm = async (values) => {
      setLoading(true);
      try {
        if (modoEdicion && turno?.id) {
          const result = await actualizarTurno(
            turno.id,
            values,
            profesionales,
            especialidades,
            instituciones
          );
    
          
          setAlertas({
            ...alertas,
            alertaVisible: true,
            alertaConfig: {
              title: "Turno Actualizado",
              message: "El turno se actualizó correctamente.",
              buttons: [
                {
                  text: "OK",
                  onPress: () => {
                    setAlertas({ ...alertas, alertaVisible: false });
                    navigation.goBack();
                  },
                  style: "default",
                },
              ],
            },
          });
        } else {
          const result = await registrarTurno(
            values,
            profesionales,
            especialidades,
            instituciones
          );
    
          
          setAlertas({
            ...alertas,
            alertaVisible: true,
            alertaConfig: {
              title: "Turno Creado",
              message: "El turno se creó correctamente.",
              buttons: [
                {
                  text: "OK",
                  onPress: () => {
                    setAlertas({ ...alertas, alertaVisible: false });
                    navigation.goBack();
                  },
                  style: "default",
                },
              ],
            },
          });
        }
      } catch (error) {
        console.error("Error en handleSubmit:", error.message);
    
        
        setAlertas({
          ...alertas,
          alertaVisible: true,
          alertaConfig: {
            title: "Error",
            message: `Error al procesar turno: ${error.message}`,
            buttons: [
              {
                text: "Cerrar",
                onPress: () => setAlertas({ ...alertas, alertaVisible: false }),
                style: "cancel",
              },
            ],
          },
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (modoEdicion && turno.profesional) {
      const profesionalId = extraerValor(turno.profesional);
      if (profesionalId) {
        handleProfesionalChange(profesionalId);
      }
    }
  }, [modoEdicion, turno.profesional, handleProfesionalChange]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        onSubmit={handleSubmitForm}
        enableReinitialize
        validationSchema={validationSchema}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => {
          return (
            <>
              <Text h3 style={styles.title}>
                {modoEdicion ? "Editar Turno" : "Registrar Nueva Agenda"}
              </Text>

              <DatePickerComponent
                date={values.fecha}
                setDate={(date) => setFieldValue("fecha", date)}
                formatDate={(date) =>
                  date
                    ? date.toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Seleccionar Fecha y Hora"
                }
                placeholder="Seleccionar Fecha y Hora"
                needsTime={true}
                errorMessage={touched.fecha && errors.fecha ? errors.fecha : ""}
              />

              <InputComponent
                placeholder="Motivo"
                value={values.motivo}
                onChangeText={handleChange("motivo")}
                onBlur={handleBlur("motivo")}
                errorMessage={
                  errors.motivo && touched.motivo ? String(errors.motivo) : ""
                }
              />

              <DropdownComponent
                data={profesionales}
                selectedValue={{
                  label: profesionales.find((prof) => prof.value === Number(values.profesional))?.label || 'Seleccione el profesional',
                  value: Number(values.profesional),
                }}
                setSelectedValue={async (item) => {
                  setFieldValue("profesional", item.value);
                  if (item.value === "add_profesional") {
                    navigation.navigate("Profesionales Salud", {
                      screen: "Agregar Profesional",
                      params: { modoEdicion: false },
                    });
                  } else {
                    await handleProfesionalChange(item.value);
                  }
                }}
                placeholder="Seleccione el profesional"
                errorMessage={touched.profesional && errors.profesional ? errors.profesional : ""}
              />

              <DropdownComponent
                data={especialidades}
                selectedValue={{
                  label: especialidades.find((esp) => esp.value === Number(values.especialidad))?.label || 'Seleccione la especialidad',
                  value: Number(values.especialidad),
                }}
                setSelectedValue={(item) => setFieldValue("especialidad", item.value)}
                placeholder={values.profesional ? "Seleccionar Especialidad" : "Primero seleccione un profesional"}
                errorMessage={
                  touched.especialidad && errors.especialidad
                    ? errors.especialidad
                    : especialidades.length === 0 && values.profesional
                    ? "No hay especialidades disponibles"
                    : ""
                }
                disabled={!values.profesional || especialidades.length === 0}
              />

              <DropdownComponent
                data={instituciones}
                selectedValue={{
                  label: instituciones.find((inst) => inst.value === Number(values.institucion))?.label || 'Seleccione la institución',
                  value: Number(values.institucion),
                }}
                setSelectedValue={(item) => {
                  setFieldValue("institucion", item.value);
                  if (item.value === "add_institucion") {
                    navigation.navigate("Instituciones Salud", {
                      screen: "Agregar Institución",
                      params: { modoEdicion: false },
                    });
                  }
                }}
                placeholder={values.profesional ? "Seleccionar Institución" : "Primero seleccione un profesional"}
                errorMessage={
                  touched.institucion && errors.institucion ? errors.institucion : ""
                }
                disabled={!values.profesional || instituciones.length === 0}
              />

              {modoEdicion ? (
                <View style={styles.switchContainer}>
                  <Text>Activar o Desactivar Turno</Text>
                  <Switch
                    value={values.activo}
                    onValueChange={(value) => setFieldValue("activo", value)}
                  />
                </View>
              ) : (
                <View style={styles.switchContainer}>
                  <Text>¿Agregar recordatorio a Google Calendar?</Text>
                  <Switch
                    value={values.recordatorio}
                    onValueChange={(value) => setFieldValue("recordatorio", value)}
                  />
                </View>
              )}
              
              <View style={styles.butonContainer}>
              <ButtonHealth
                title={modoEdicion ? "Guardar Cambios" : "Registrar Turno"}
                onPress={handleSubmit}
              />

              <ButtonHealth
                title={"Volver"}
                onPress={() => navigation.goBack()}
              />
              </View>
            </>
          );
        }}
      </Formik>
      <AlertCustom
  visible={alertas.alertaVisible}
  title={alertas.alertaConfig.title}
  message={alertas.alertaConfig.message}
  buttons={alertas.alertaConfig.buttons}
/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#1976d2",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  butonContainer:{
    gap: 10
  }
});

export default AgendaTurnosAgregar;
