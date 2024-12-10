import React, { useRef, useState } from "react";
import { View, ScrollView, LayoutAnimation, Platform, UIManager, StyleSheet, Modal, Text, TouchableOpacity } from "react-native";
import { Button, Dialog } from "@rneui/themed";
import { Formik } from "formik";
import InputComponent from "../../components/inputs/InputComponent";
import DropdownComponent from "../../components/inputs/DropdownComponent";
import AlertCustom from "../../components/AlertCustom";
import { globalStyles } from "../../assets/themed/globalStyle";
import AddressInput from '../../components/inputs/AddressInput';
import { useInstitucionForm } from "./hooks/useInstitucionForm";
import ButtonHealth from "../../components/ButtonHealth";

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AgregarInstitucion = ({ route, navigation }) => {
  const { params } = route;
  const { institucionIndex = {}, modoEdicion = false } = params || {};
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [isProfesionalesModalVisible, setIsProfesionalesModalVisible] = useState(false); 
  const [valueProfesionales, setValueProfesionales] = useState([]); 
  const [idInstitucion, setIdInstitucion] = useState(null); // Aquí declaramos el idInstitucion
  const formikRef = useRef(null);

  const {
    profesionales,
    alertas,
    setAlertas,
    validationSchema,
    handleSubmit,
    handleVincularProfesionales,
    reloadProfesionales
  } = useInstitucionForm(institucionIndex, modoEdicion);

  React.useEffect(() => {
    const fetchProfesionalesOnOpen = async () => {
      if (isProfesionalesModalVisible) {
        await reloadProfesionales(); // Recarga los profesionales cuando el diálogo se abre
      }
    };
  
    fetchProfesionalesOnOpen();
  }, [isProfesionalesModalVisible]);

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const handleSelectAddress = (address) => {
    formikRef.current.setFieldValue('direccionCompleta', address.direccionCompleta); 
    setIsModalVisible(false);
  };

  const handleConfirmSubmit = async (values) => {
    const idNuevaInstitucion = await handleSubmit(values); 
    if (idNuevaInstitucion) {
      setIdInstitucion(idNuevaInstitucion); 
      setValueProfesionales([]); 
      setIsProfesionalesModalVisible(true); 
    }
  };

  const handleProfesionalesSelected = (selectedItems) => {
    setValueProfesionales(selectedItems);
  };

  const handleProfesionalesVinculacion = async () => {
    if (idInstitucion && valueProfesionales.length > 0) {
      try {
        await handleVincularProfesionales(idInstitucion, valueProfesionales);

        setIsProfesionalesModalVisible(false); 
        setAlertas({
          ...alertas,
          alertaVisible: { alertaBoolean: true, mensaje: 'Profesionales vinculados con éxito.' },
        });
      } catch (error) {
        setAlertas({
          ...alertas,
          alertaVisibleError: { alertaBoolean: true, mensaje: `Error al vincular profesionales: ${error.message}` },
        });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.containerStyle}>
      <Formik
        innerRef={formikRef}
        initialValues={{
          nombre: modoEdicion ? institucionIndex.nombre || "" : "",
          email: modoEdicion
            ? institucionIndex?.contactos[0]?.mailAlternativo || ""
            : "",
          telefono: modoEdicion
            ? institucionIndex?.contactos[0]?.telefono || ""
            : "",
          direccionCompleta: modoEdicion
            ? institucionIndex?.direccion?.direccion || ""
            : "",
            piso:  modoEdicion
            ? institucionIndex?.direccion?.piso || ""
            : "",
            dto:  modoEdicion
            ? institucionIndex?.direccion?.departamento || ""
            : "",  
            referencias:  modoEdicion
            ? institucionIndex?.direccion?.referencia || ""
            : "",
        }}
        validationSchema={validationSchema}
        onSubmit={() => setAlertas({ ...alertas, alertaEstaSeguro: true })} 
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
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
            <InputComponent
              placeholder="Teléfono"
              value={values.telefono}
              onChangeText={handleChange("telefono")}
              onBlur={handleBlur("telefono")}
              keyboardType="phone-pad"
              errorMessage={errors.telefono && touched.telefono ? String(errors.telefono) : ""}
            />

            {/* Selección de la dirección */}
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ width: '100%' }}>
              <View pointerEvents="none">
                <InputComponent
                  placeholder="Dirección completa"
                  value={values.direccionCompleta}
                  editable={false} 
                  errorMessage={errors.direccionCompleta && touched.direccionCompleta ? String(errors.direccionCompleta) : ""}
                />
              </View>
            </TouchableOpacity>

            {/* Mostrar PISO, DTO, REFERENCIAS solo si se ha seleccionado una dirección */}
            {values.direccionCompleta && (
              <>
                <InputComponent
                  placeholder="PISO"
                  value={values.piso}
                  onChangeText={handleChange("piso")}
                  onBlur={handleBlur("piso")}
                  errorMessage={errors.piso && touched.piso ? String(errors.piso) : ""}
                />
                <InputComponent
                  placeholder="DTO"
                  value={values.dto}
                  onChangeText={handleChange("dto")}
                  onBlur={handleBlur("dto")}
                  errorMessage={errors.dto && touched.dto ? String(errors.dto) : ""}
                />
                <InputComponent
                  placeholder="REFERENCIAS"
                  value={values.referencias}
                  onChangeText={handleChange("referencias")}
                  onBlur={handleBlur("referencias")}
                  errorMessage={errors.referencias && touched.referencias ? String(errors.referencias) : ""}
                />
              </>
            )}

            {/* Botón para agregar institución */}
            <View style={styles.butonContainer}>
            <ButtonHealth
              title={modoEdicion ? "Editar Institución" : "Agregar Institución"}
              onPress={handleSubmit as any} 
            />
            <ButtonHealth
              title="Volver"
              onPress={() => {
                navigation.goBack();
              }}
            />
            </View>
          </View>
        )}
      </Formik>

      {/* Modal para buscar direcciones */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)} 
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Buscar dirección</Text>
          <AddressInput onSelectAddress={handleSelectAddress} />
          <Button
            title="Cerrar"
            onPress={() => setIsModalVisible(false)}
            buttonStyle={styles.closeButton}
          />
        </View>
      </Modal>

      <Dialog isVisible={isProfesionalesModalVisible}>
        <Dialog.Title title="Vincular Profesionales" />
        <DropdownComponent
          data={profesionales} 
          selectedValue={valueProfesionales}
          setSelectedValue={handleProfesionalesSelected} 
          placeholder="Seleccione los profesionales"
          multiselect={true} 
        />
        <Dialog.Actions>
        <ButtonHealth
    title="Crear Profesional"
    onPress={() =>
      navigation.navigate("Profesionales Salud", {
        screen: "Agregar Profesional",
        params: { modoEdicion: false },
      })
    }
    style={{ backgroundColor: "#3498db", marginBottom: 10, marginRight: 10 }}
    size="small"  />
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", gap: 10 }}>
        <ButtonHealth
    title="Aceptar"
    onPress={handleProfesionalesVinculacion}
    style={{ backgroundColor: "green", marginRight: 10 }} // Botón verde con separación
    size="small"  />
  <ButtonHealth
    title="Cancelar"
    onPress={() => setIsProfesionalesModalVisible(false)}
    style={{ backgroundColor: "red" }} // Botón rojo
    size="small"  />
    </View>
        </Dialog.Actions>
      </Dialog>

      <Dialog isVisible={alertas.alertaEstaSeguro}>
        <Dialog.Title title="Espera..." />
        <Text>{modoEdicion ? "¿Desea editar esta institución?" : "¿Desea agregar esta institución?"}</Text>
        <Dialog.Actions>
          <Button
            title="Aceptar"
            onPress={() => handleConfirmSubmit(formikRef.current.values)} 
            type="clear"
            titleStyle={{ color: "green" }}
          />
          <Button
            title="Cancelar"
            onPress={() => setAlertas({ ...alertas, alertaEstaSeguro: false })}
            type="clear"
            titleStyle={{ color: "red" }}
          />
        </Dialog.Actions>
      </Dialog>

      <AlertCustom
  visible={alertas.alertaVisible.alertaBoolean}
  title="¡Perfecto!"
  message={alertas.alertaVisible.mensaje}
  buttons={[
    {
      text: "Aceptar",
      onPress: () => {
        setAlertas({
          ...alertas,
          alertaVisible: { alertaBoolean: false, mensaje: "" },
        });

        // Navegar a la lista de instituciones
        navigation.navigate("InstitucionSaludList", {
          EditadoOAgregado: true,
        });
      },
      style: "default",
    },
  ]}
/>

<AlertCustom
  visible={alertas.alertaVisibleError.alertaBoolean}
  title="¡ERROR!"
  message={alertas.alertaVisibleError.mensaje}
  buttons={[
    {
      text: "Aceptar",
      onPress: () => {
        setAlertas({
          ...alertas,
          alertaVisibleError: { alertaBoolean: false, mensaje: "" },
        });
      },
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
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#FF6961',
  },
  createButton: {
    backgroundColor: '#3498db',
  },
  addButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  butonContainer:{
    gap: 10
  }
});

export default AgregarInstitucion;
