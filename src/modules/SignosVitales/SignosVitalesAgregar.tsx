// screens/SignosVitalesAgregar.js
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import InputComponent from "../../components/inputs/InputComponent";
import DropdownComponent from "../../components/inputs/DropdownComponent";
import { globalStyles } from "../../assets/themed/globalStyle";
import AxiosHealth from "../../Interceptor/AxiosHealth";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ButtonHealth from "../../components/ButtonHealth";
import AlertCustom from "../../components/AlertCustom"; // Asegúrate de que la ruta sea correcta

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SignosVitalesAgregar = ({ route, navigation }) => {
  const [existingSignosVitales, setExistingSignosVitales] = useState([]);
  const [signosVitalesBase, setSignosVitalesBase] = useState([]);
  const [selectedSigno, setSelectedSigno] = useState(null);
  const { modoEdicion, signoVital } = route.params || {};
  const isEditMode = !!modoEdicion;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const fetchData = async () => {
      const signosVitalesArray = await fetchSignosVitales(); // Ajuste para retornar el arreglo
      await fetchExistingSignosVitales();

      if (isEditMode && signoVital) {
        const signoCorrespondiente = signosVitalesArray.find(
          (signo) =>
            signo.value === signoVital.tipoSignoVitalId?.toString() ||
            signo.label === signoVital.tipoSignoVital
        );
        if (signoCorrespondiente) {
          setSelectedSigno(signoCorrespondiente);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchSignosVitales = async () => {
    try {
      const response = await AxiosHealth.get("/tiposSignosVitales");
      const signosVitalesArray = response.data.map((signo) => ({
        label: signo.nombre,
        value: signo.id.toString(), // Asegura que el value sea string
        cantidadValores: signo.cantidadValores,
      }));

      setSignosVitalesBase(signosVitalesArray);
      return signosVitalesArray; // Retornamos el arreglo para usarlo en fetchData
    } catch (error) {
      console.error("Error fetching tipos signos vitales", error);
      return [];
    }
  };

  const fetchExistingSignosVitales = async () => {
    try {
      const idHc = await AsyncStorage.getItem("idHc");
      if (!idHc) {
        throw new Error("ID de historia clínica no disponible");
      }

      const response = await AxiosHealth.get(
        `/historiasMedicas/${idHc}/signosVitalesCustoms`
      );

      // Asegúrate de que cada signo vital tenga tipoSignoVitalId
      const signos = response.data.map((signo) => ({
        ...signo,
        tipoSignoVitalId: signo.tipoSignoVitalId
          ? signo.tipoSignoVitalId.toString()
          : signo.tipoSignoVital, // Ajusta según la estructura real
      }));

      setExistingSignosVitales(signos);
    } catch (error) {
      console.error("Error fetching existing signos vitales:", error);
    }
  };

  const getValidationSchema = (
    cantidadValores,
    existingSignosVitales,
    isEditMode,
    currentSignoId,
    signoVital
  ) => {
    return yup.object().shape({
      // Validación para tipoSignoVital solo si no es modo edición
      tipoSignoVital: !isEditMode
        ? yup
            .string()
            .required("El tipo de signo vital es requerido")
            .test(
              "unique",
              "Ya existe un signo vital de este tipo",
              function (value) {
                if (!value) return true; // Ya está manejado por `required`
                return !existingSignosVitales.some(
                  (signo) =>
                    signo.tipoSignoVitalId === value &&
                    (!isEditMode || signo.id !== currentSignoId)
                );
              }
            )
        : yup.string(), // En modo edición, no se valida tipoSignoVital

      minimo: yup
        .number()
        .typeError("Debe ser un número")
        .required("El valor mínimo es requerido"),

      maximo: yup
        .number()
        .typeError("Debe ser un número")
        .required("El valor máximo es requerido")
        .moreThan(
          yup.ref("minimo"),
          "El valor máximo debe ser mayor que el valor mínimo"
        ),

      // Validación condicional para segundoMinimo
      segundoMinimo: isEditMode
        ? signoVital.segundoMinimo !== null && signoVital.segundoMinimo !== undefined
          ? yup
              .number()
              .typeError("Debe ser un número")
              .required("El segundo valor mínimo es requerido")
          : yup.number().notRequired()
        : cantidadValores === 2
        ? yup
            .number()
            .typeError("Debe ser un número")
            .required("El segundo valor mínimo es requerido")
        : yup.number().notRequired(),

      // Validación condicional para segundoMaximo
      segundoMaximo: isEditMode
        ? signoVital.segundoMaximo !== null && signoVital.segundoMaximo !== undefined
          ? yup
              .number()
              .typeError("Debe ser un número")
              .required("El segundo valor máximo es requerido")
              .moreThan(
                yup.ref("segundoMinimo"),
                "El segundo valor máximo debe ser mayor que el segundo valor mínimo"
              )
          : yup.number().notRequired()
        : cantidadValores === 2
        ? yup
            .number()
            .typeError("Debe ser un número")
            .required("El segundo valor máximo es requerido")
            .moreThan(
              yup.ref("segundoMinimo"),
              "El segundo valor máximo debe ser mayor que el segundo valor mínimo"
            )
        : yup.number().notRequired(),
    });
  };

  const guardarSignoVital = async (values) => {
    try {
      const idHc = await AsyncStorage.getItem("idHc");

      // Encontrar el ID correspondiente al tipo de signo vital seleccionado
      const tipoSignoVital = signosVitalesBase.find(
        (signo) => signo.label === values.tipoSignoVital
      );
      const tipoSignoVitalId = tipoSignoVital ? tipoSignoVital.value : null;

      await AxiosHealth.post("/signosVitalesCustoms", {
        minimo: values.minimo,
        maximo: values.maximo,
        segundoMinimo: values.segundoMinimo || null,
        segundoMaximo: values.segundoMaximo || null,
        historiaMedicaId: idHc,
        tipoSignoVitalId: tipoSignoVitalId,
      });
      setAlertas({
        ...alertas,
        alertaVisible: {
          alertaBoolean: true,
          mensaje: "Signo vital agregado correctamente.",
        },
      });
    } catch (error) {
      console.error("Error guardando signo vital:", error);
      setAlertas({
        ...alertas,
        alertaVisibleError: {
          alertaBoolean: true,
          mensaje: `Error al agregar signo vital: ${error.message}`,
        },
      });
    }
  };

  const editarSignoVital = async (values) => {
    try {
      await AxiosHealth.put(`/signosVitalesCustoms/${signoVital.id}`, {
        minimo: values.minimo,
        maximo: values.maximo,
        segundoMinimo: values.segundoMinimo || null,
        segundoMaximo: values.segundoMaximo || null,
      });
      setAlertas({
        ...alertas,
        alertaVisible: {
          alertaBoolean: true,
          mensaje: "Signo vital actualizado correctamente.",
        },
      });
      navigation.navigate("SignosVitales", { EditadoOAgregado: true });
    } catch (error) {
      console.error("Error actualizando signo vital:", error);
      setAlertas({
        ...alertas,
        alertaVisibleError: {
          alertaBoolean: true,
          mensaje: `Error al actualizar signo vital: ${error.message}`,
        },
      });
    }
  };

  const renderInputs = (
    cantidadValores,
    values,
    handleChange,
    handleBlur,
    errors,
    touched
  ) => {
    return (
      <>
        <InputComponent
          placeholder="Valor Mínimo Aceptable"
          value={values.minimo}
          onChangeText={handleChange("minimo")}
          onBlur={handleBlur("minimo")}
          keyboardType="numeric"
          errorMessage={errors.minimo && touched.minimo ? errors.minimo : ""}
        />
        <InputComponent
          placeholder="Valor Máximo Aceptable"
          value={values.maximo}
          onChangeText={handleChange("maximo")}
          onBlur={handleBlur("maximo")}
          keyboardType="numeric"
          errorMessage={errors.maximo && touched.maximo ? errors.maximo : ""}
        />
        {cantidadValores === 2 && (
          <>
            <InputComponent
              placeholder="Segundo Valor Mínimo Aceptable"
              value={values.segundoMinimo}
              onChangeText={handleChange("segundoMinimo")}
              onBlur={handleBlur("segundoMinimo")}
              keyboardType="numeric"
              errorMessage={
                errors.segundoMinimo && touched.segundoMinimo
                  ? errors.segundoMinimo
                  : ""
              }
            />
            <InputComponent
              placeholder="Segundo Valor Máximo Aceptable"
              value={values.segundoMaximo}
              onChangeText={handleChange("segundoMaximo")}
              onBlur={handleBlur("segundoMaximo")}
              keyboardType="numeric"
              errorMessage={
                errors.segundoMaximo && touched.segundoMaximo
                  ? errors.segundoMaximo
                  : ""
              }
            />
          </>
        )}
      </>
    );
  };

  // Estado y alertas
  const [alertas, setAlertas] = useState({
    alertaVisible: { alertaBoolean: false, mensaje: "" },
    alertaVisibleError: { alertaBoolean: false, mensaje: "" },
  });

  // Función para cerrar alertas genéricas
  const handleCloseAlerta = () => {
    setAlertas((prev) => ({
      ...prev,
      alertaVisible: { alertaBoolean: false, mensaje: "" },
      alertaVisibleError: { alertaBoolean: false, mensaje: "" },
    }));
    navigation.navigate("SignosVitales", { EditadoOAgregado: true });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Derivar signosVitales disponibles para el dropdown (excluir los ya existentes)
  const availableSignosVitales = signosVitalesBase.filter((signo) => {
    if (isEditMode && signo.value === signoVital.tipoSignoVitalId?.toString()) {
      return true; // Permitir el signo vital actual en modo edición
    }
    return !existingSignosVitales.some(
      (existing) =>
        existing.tipoSignoVitalId === signo.value.toString() ||
        existing.tipoSignoVital === signo.label
    );
  });

  return (
    <ScrollView contentContainerStyle={globalStyles.containerStyle}>
      <Formik
        initialValues={{
          tipoSignoVitalId: signoVital?.tipoSignoVitalId
            ? signoVital.tipoSignoVitalId.toString()
            : "",
          tipoSignoVital: signoVital?.tipoSignoVital || "",
          minimo: signoVital?.minimo?.toString() || "",
          maximo: signoVital?.maximo?.toString() || "",
          segundoMinimo: signoVital?.segundoMinimo?.toString() || "",
          segundoMaximo: signoVital?.segundoMaximo?.toString() || "",
        }}
        enableReinitialize={true}
        validationSchema={getValidationSchema(
          selectedSigno?.cantidadValores || 1,
          existingSignosVitales,
          isEditMode,
          signoVital?.id,
          signoVital // Pasamos signoVital para determinar si existen segundoMinimo y segundoMaximo
        )}
        onSubmit={(values) => {
          if (isEditMode) {
            editarSignoVital(values);
          } else {
            guardarSignoVital(values);
          }
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <View style={[globalStyles.formContainerStyle, styles.switchContainer]}>
            {!isEditMode && (
              <DropdownComponent
                data={availableSignosVitales}
                selectedValue={
                  availableSignosVitales.find(
                    (opt) => opt.value === values.tipoSignoVitalId
                  ) || { label: "", value: "" }
                }
                setSelectedValue={(selectedItem) => {
                  setFieldValue("tipoSignoVitalId", selectedItem.value);
                  setFieldValue("tipoSignoVital", selectedItem.label);
                  setSelectedSigno(selectedItem);
                }}
                placeholder="Selecciona un signo vital"
                errorMessage={
                  errors.tipoSignoVital && touched.tipoSignoVital
                    ? String(errors.tipoSignoVital)
                    : ""
                }
              />
            )}
            {renderInputs(
              selectedSigno?.cantidadValores || 1,
              values,
              handleChange,
              handleBlur,
              errors,
              touched
            )}
            <View style={styles.buttonContainer}>
              <ButtonHealth
                title={
                  isEditMode
                    ? "Actualizar Signo Vital"
                    : "Agregar Signo Vital"
                }
                onPress={handleSubmit}
                size="medium"
              />
              <ButtonHealth
                title="Volver"
                onPress={() => navigation.goBack()}
                size="medium"
              />
            </View>
          </View>
        )}
      </Formik>

      {/* Mostrar las alertas en base a su estado */}
      {alertas.alertaVisible.alertaBoolean && (
  <AlertCustom
    visible={alertas.alertaVisible.alertaBoolean}
    title="Operación Exitosa"
    message={alertas.alertaVisible.mensaje}
    buttons={[
      {
        text: "OK",
        onPress: () => {
          setAlertas(prev => ({
            ...prev,
            alertaVisible: { alertaBoolean: false, mensaje: "" },
          }));
          navigation.goBack()
        },
        style: "default",
      },
    ]}
  />
)}

{alertas.alertaVisibleError.alertaBoolean && (
  <AlertCustom
    visible={alertas.alertaVisibleError.alertaBoolean}
    title="Error"
    message={alertas.alertaVisibleError.mensaje}
    buttons={[
      {
        text: "OK",
        onPress: () => {
          setAlertas(prev => ({
            ...prev,
            alertaVisibleError: { alertaBoolean: false, mensaje: "" },
          }));
        },
        style: "destructive",
      },
    ]}
  />
)}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignosVitalesAgregar;
