import React, { useRef } from "react";
import { View, ScrollView, LayoutAnimation, Platform, UIManager, StyleSheet } from "react-native";
import { Button, Dialog, Text } from "@rneui/themed";
import { Formik } from "formik";
import InputComponent from "../../components/inputs/InputComponent";
import DropdownComponent from "../../components/inputs/DropdownComponent";
import AlertCustom from "../../components/AlertCustom";
import { globalStyles } from "../../assets/themed/globalStyle";
import { useProfesionalForm } from "./hooks/useProfesionalForm";
import ButtonHealth from "../../components/ButtonHealth";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfesionalAgregar = ({ route, navigation }) => {
  const { params } = route;
  const { profesionalIndex = {}, modoEdicion = false } = params || {};
  const [valueCentros, setValueCentros] = React.useState([]);
  const formikRef = useRef(null);

  const {
    idProfesional,
    especialidades,
    centros,
    alertas,
    setAlertas,
    validationSchema,
    handleSubmit,
    handleConfirmSubmit,
    handleVincular,
    tipoMatriculaListado,
  } = useProfesionalForm(profesionalIndex, modoEdicion, valueCentros, setValueCentros, formikRef, navigation);

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  return (
    <ScrollView contentContainerStyle={globalStyles.containerStyle}>
      <Formik
        innerRef={formikRef}
        initialValues={{
          nombre: modoEdicion ? profesionalIndex.nombre || "" : "",
          email: modoEdicion
            ? profesionalIndex?.contactos[0]?.mailAlternativo || ""
            : "",
          matricula: modoEdicion ? profesionalIndex.matricula || "" : "",
          tipoMatriculaId: modoEdicion
          ? tipoMatriculaListado.find(
              (item) => item.value === profesionalIndex.tipoMatricula
            ) || null
          : null,
          tipoMatricula: modoEdicion
            ? profesionalIndex.tipoMatricula || ""
            : "",
          telefono: modoEdicion
            ? profesionalIndex?.contactos[0]?.telefono || ""
            : "",
            especialidadId: modoEdicion
            ? (Array.isArray(profesionalIndex?.especialidades)
                ? profesionalIndex.especialidades.map((e) => ({
                    label: e.nombre,
                    value: e.id,
                  }))
                : [])
            : [],
          
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View style={[globalStyles.formContainerStyle, styles.switchContainer]}>
            <InputComponent
              placeholder="Nombre" 
              value={values.nombre}
              onChangeText={handleChange("nombre")}
              onBlur={handleBlur("nombre")}
              errorMessage={errors.nombre && touched.nombre ? String(errors.nombre) : ""}
            />
            <InputComponent
              placeholder="Mail"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              errorMessage={errors.email && touched.email ? String(errors.email) : ""}
            />
            <DropdownComponent
              data={especialidades}
              selectedValue={values.especialidadId}
              setSelectedValue={(items) => {setFieldValue("especialidadId", items); console.log("eee")}}
              placeholder="Especialidades"  
              multiselect
              errorMessage={errors.especialidadId && touched.especialidadId ? String(errors.especialidadId) : ""}
            />
            <DropdownComponent
              data={tipoMatriculaListado}
              selectedValue={values.tipoMatriculaId}
              setSelectedValue={(item) => {
                setFieldValue("tipoMatriculaId", item.value.toString());
                setFieldValue("tipoMatricula", item.label);
              }}
              placeholder="Tipo de Matricula"
              errorMessage={errors.tipoMatriculaId && touched.tipoMatriculaId ? String(errors.tipoMatriculaId) : ""}
            />
            <InputComponent
              placeholder="Matricula"
              value={values.matricula.toString()}
              onChangeText={handleChange("matricula")}
              onBlur={handleBlur("matricula")}
              keyboardType="numeric"
              errorMessage={errors.matricula && touched.matricula ? String(errors.matricula) : ""}
            />
            <InputComponent
              placeholder="Telefono"
              value={values.telefono}
              onChangeText={handleChange("telefono")}
              onBlur={handleBlur("telefono")}
              keyboardType="phone-pad"
              errorMessage={errors.telefono && touched.telefono ? String(errors.telefono) : ""}
            />
            <View style={styles.butonContainer}>
<ButtonHealth
  title={modoEdicion ? "Editar Profesional" : "Agregar Profesional"}
  onPress={handleSubmit}
/>
<ButtonHealth
    title="Volver"
    onPress={() => {
      navigation.goBack();
    }}
  />
  </View>
            <Dialog isVisible={alertas.alertaEstaSeguro}>
              <Dialog.Title title="Espera..." />
              <Text>{modoEdicion ? "¿Desea editar este profesional?" : "¿Desea agregar este profesional?"}</Text>
              <Dialog.Actions>
                <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", gap: 10 }}>
              <ButtonHealth
  title="Aceptar"
  onPress={() => handleConfirmSubmit(values, formikRef.current.setFieldError)}
  style={{ backgroundColor: "green" }}
  size="small"
/>
<ButtonHealth
  title="Cancelar"
  onPress={() => setAlertas({ ...alertas, alertaEstaSeguro: false })}
  style={{ backgroundColor: "red" }}
  size="small"

/>
</View>
              </Dialog.Actions>
            </Dialog>
          </View>
        )}
      </Formik>

      <Dialog isVisible={alertas.alertaAsignarCentro}>
        <Dialog.Title title="Espera..." />
        <Text>¿Desea vincular este Profesional a una Institucion?</Text>
        <DropdownComponent
  data={centros}
  selectedValue={valueCentros}
  setSelectedValue={(value) => {
    setValueCentros(value);
  }}
  placeholder="Centros a vincular"
/>
<Dialog.Actions>
  <View>
    {/* Botón "Crear Profesional" centrado y con margen inferior */}
    <ButtonHealth
      title="Crear Centro"
      onPress={() =>
        navigation.navigate("Instituciones Salud", {
          screen: "AgregarInstitucion",
          params: { modoEdicion: false },
        })
      }
      style={{ backgroundColor: "#3498db", marginBottom: 10 }} 
      size="small"
    />
    {/* Botones "Aceptar" y "Cancelar" alineados horizontalmente */}
    <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", gap: 10 }}>
      <ButtonHealth
        title="Aceptar"
        onPress={handleVincular}
        style={{ backgroundColor: "green" }} 
        size="small"
      />
      <ButtonHealth
        title="Cancelar"
        onPress={() =>
          navigation.navigate("ProfesionalSaludList", {
            EditadoOAgregado: true,
          })
        }
        style={{ backgroundColor: "red" }} 
        size="small"
      />
    </View>
  </View>
</Dialog.Actions>
      </Dialog>

      <AlertCustom
  visible={alertas.alertaVisible.alertaBoolean}
  onClose={() => {
    setAlertas({
      ...alertas,
      alertaVisible: { alertaBoolean: false, mensaje: "" },
    });
    navigation.navigate("ProfesionalSaludList", {
      EditadoOAgregado: true,
    });
  }}
  title={"¡Perfecto!"}
  message={alertas.alertaVisible.mensaje}
  buttons={[
    {
      text: "Aceptar",
      onPress: () => {
        setAlertas({
          ...alertas,
          alertaVisible: { alertaBoolean: false, mensaje: "" },
        });
        navigation.navigate("ProfesionalSaludList", {
          EditadoOAgregado: true,
        });
      },
      style: "default",
    },
  ]}
/>

<AlertCustom
  visible={alertas.alertaVisibleError.alertaBoolean}
  onClose={() =>
    setAlertas({
      ...alertas,
      alertaVisibleError: { alertaBoolean: false, mensaje: "" },
    })
  }
  title={"¡ERROR!"}
  message={alertas.alertaVisibleError.mensaje}
  buttons={[
    {
      text: "Aceptar",
      onPress: () =>
        setAlertas({
          ...alertas,
          alertaVisibleError: { alertaBoolean: false, mensaje: "" },
        }),
      style: "destructive",
    },
  ]}
/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    backgroundColor: '#fff',
  },
  butonContainer:{
    gap: 10
  }
})

export default ProfesionalAgregar;
