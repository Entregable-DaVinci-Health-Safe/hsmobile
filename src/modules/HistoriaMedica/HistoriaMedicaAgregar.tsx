
import React, { useEffect, useState } from 'react';
import { View, ScrollView, LayoutAnimation, Platform, UIManager, StyleSheet, Alert, TouchableOpacity, Text, Image, Linking } from 'react-native';
import { Formik } from 'formik';
import DropdownComponent from '../../components/inputs/DropdownComponent';
import InputComponent from '../../components/inputs/InputComponent';
import ButtonHealth from '../../components/ButtonHealth';
import DatePickerComponent from '../../components/inputs/DatePickerComponent';
import { useVisitasForm } from './hooks/useVisitaMedicaForm';
import AlertCustom from '../../components/AlertCustom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dialog } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Entypo } from '@expo/vector-icons';
import * as yup from 'yup';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HistoriaMedicaAgregar = ({ route, navigation }) => {
  const { params } = route;
  const { modoEdicion = false, visita = {}, hcIdIntegrante: hcIdFromParams } = params || {};
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [hcIdIntegrante, setHcIdIntegrante] = useState(null);
  const [attachModalVisible, setAttachModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('Receta');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileType, setFileType] = useState('');

  const {
    nombreArchivo,
    setNombreArchivo,
    uriArchivo,
    setUriArchivo,
    dialogVisible,
    setDialogVisible,
    posicionadoCheck,
    setPosicionadoCheck,
    atencionVirtual,
    setAtencionVirtual,
    date,
    setDate,
    instituciones,
    setInstituciones,
    profesionales,
    setProfesionales,
    especialidades,
    setEspecialidades,
    diagnosticos,
    alertas,
    setAlertas,
    validationSchema,
    handleSubmit,
    setIndicacionesDescripcion,
    indicacionesDescripcion,
    handleProfesionalChange,
    handleInstitucionChange,
  } = useVisitasForm(visita, modoEdicion, hcIdIntegrante);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  useEffect(() => {
    const fetchHcId = async () => {
      if (hcIdFromParams) {
        setHcIdIntegrante(hcIdFromParams);
      } else {
        try {
          const storedHcId = await AsyncStorage.getItem('idHc');
          if (storedHcId) {
            setHcIdIntegrante(storedHcId);
          } else {
            Alert.alert('Error', 'No se encontró el ID de Historia Clínica.');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Error obteniendo idHc de AsyncStorage:', error);
          Alert.alert('Error', 'No se pudo obtener el ID de Historia Clínica.');
          navigation.goBack();
        }
      }
    };

    fetchHcId();
  }, [hcIdFromParams, navigation]);

  const pickDocument = async () => {
    setAttachModalVisible(false); 
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });

    if (result.type !== "cancel") {
      setFileUri(result.uri);
      setFileName(result.name || "document");
      setFileType(result.mimeType || 'document');
      setAttachModalVisible(true); 
    }
  };

  const handleAttachFile = async (values, actions) => {

    
    
    setUriArchivo(fileUri);
    setNombreArchivo(fileName);
    setPosicionadoCheck(selectedType);
    setIndicacionesDescripcion(values.indicaciones);
    setAttachModalVisible(false);
    
    setFileUri('');
    setFileName('');
    setFileType('');
    actions.resetForm();
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFileUri(file.uri);
        setFileName(file.name);
        setFileType(file.mimeType || '');
      }
    } catch (error) {
      console.error('Error al seleccionar el archivo:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingVertical: 0, paddingHorizontal: 20, height: "100%" }}>
        <Formik
          initialValues={{
            fechaVisita: visita.fechaVisita || '',
            atencionVirtual: visita.atencionVirtual || false,
            profesionalId: visita.profesional?.id || '',
            institucionId: visita.institucionSalud?.id || '',
            especialidadId: visita.especialidad?.id || '',
            diagnosticoId: visita.diagnostico?.id || '',
            indicaciones: visita.indicaciones || '',
            tipoDocumento: 'Receta', 
          }}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            handleSubmit(values, actions);
          }}
          validate={(values) => {
            try {
              validationSchema.validateSync(values, { abortEarly: false });
            } catch (validationErrors) {
              console.error('Errores de validación:', validationErrors.inner);
              const formattedErrors = {};
              validationErrors.inner.forEach((error) => {
                formattedErrors[error.path] = error.message;
              });
              return formattedErrors; 
            }
          }}
          validateOnChange
          validateOnBlur
          enableReinitialize
        >
          {({
            handleChange,
            handleSubmit,
            values,
            setFieldValue,
            touched,
            errors,
          }) => {
            
            useEffect(() => {
              if (visita.profesional?.id) {
                handleProfesionalChange(visita.profesional.id);
              }
            }, [visita.profesional?.id, handleProfesionalChange]);

            return (
              <View style={styles.formContainer}>
                {/* Fecha de Visita */}
                <DatePickerComponent
                  date={date}
                  setDate={(selectedDate) => {
                    setDate(selectedDate);
                    setFieldValue('fechaVisita', selectedDate ? selectedDate.toISOString().split('T')[0] : '');
                  }}
                  showDatePicker={showDatePicker}
                  setShowDatePicker={setShowDatePicker}
                  formatDate={(date) => (date ? date.toISOString().split('T')[0] : 'Seleccione una fecha')}
                  placeholder="Seleccione una fecha"
                  errorMessage={touched.fechaVisita && errors.fechaVisita ? String(errors.fechaVisita) : ''}
                />

                {/* Profesional */}
                <DropdownComponent
                  data={profesionales}
                  selectedValue={{
                    label: profesionales.find((profesional) => profesional.value === values.profesionalId)?.label || 'Seleccione el profesional',
                    value: values.profesionalId,
                  }}
                  setSelectedValue={(item) => {
                    setFieldValue('profesionalId', item.value);
                    handleProfesionalChange(item.value);
                  }}
                  placeholder="Seleccione el profesional"
                  errorMessage={touched.profesionalId && errors.profesionalId ? String(errors.profesionalId) : ''}
                />

                {/* Institución */}
                <DropdownComponent
                  data={instituciones}
                  selectedValue={{
                    label: instituciones.find((institucion) => institucion.value === values.institucionId)?.label || 'Seleccione la institución',
                    value: values.institucionId,
                  }}
                  setSelectedValue={(item) => {
                    setFieldValue('institucionId', item.value);
                    handleInstitucionChange(item.value);
                  }}
                  placeholder="Seleccione la institución"
                  errorMessage={touched.institucionId && errors.institucionId ? String(errors.institucionId) : ''}
                />

                {/* Especialidad */}
                <DropdownComponent
                  data={especialidades}
                  selectedValue={{
                    label: especialidades.find((especialidad) => especialidad.value === values.especialidadId)?.label || 'Seleccione la especialidad',
                    value: values.especialidadId,
                  }}
                  setSelectedValue={(item) => {
                    setFieldValue('especialidadId', item.value);
                  }}
                  placeholder="Seleccione la especialidad"
                  errorMessage={touched.especialidadId && errors.especialidadId ? String(errors.especialidadId) : ''}
                />

                {/* Diagnóstico */}
                <DropdownComponent
                  data={diagnosticos}
                  selectedValue={{
                    label: diagnosticos.find((diagnostico) => diagnostico.value === values.diagnosticoId)?.label || 'Seleccione el diagnóstico',
                    value: values.diagnosticoId,
                  }}
                  setSelectedValue={(item) => {
                    setFieldValue('diagnosticoId', item.value);
                  }}
                  placeholder="Seleccione el diagnóstico"
                  errorMessage={touched.diagnosticoId && errors.diagnosticoId ? String(errors.diagnosticoId) : ''}
                />

                {/* Indicaciones */}
                <InputComponent
                  placeholder="Indicaciones"
                  value={values.indicaciones}
                  onChangeText={handleChange('indicaciones')}
                  multiline
                  errorMessage={touched.indicaciones && errors.indicaciones ? String(errors.indicaciones) : ''}
                />

                {/* Botón para abrir el diálogo de adjuntar archivo */}
                {!modoEdicion && (
                <ButtonHealth
                  title="Adjuntar Archivo"
                  onPress={() => setAttachModalVisible(true)}
                  style={styles.attachButton}
                />
                )
                }
                {/* Mostrar archivo adjunto seleccionado */}
                {uriArchivo ? (
                  <View style={styles.filePreviewContainer}>
                    {fileType.startsWith('image/') ? (
                      <Image source={{ uri: uriArchivo }} style={styles.previewImage} />
                    ) : (
                      <TouchableOpacity onPress={() => Linking.openURL(uriArchivo)}>
                        <Text style={styles.linkText}>Previsualizar Archivo</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.fileName}>{nombreArchivo}</Text>
                  </View>
                ) : null}

                {/* Botones de Enviar y Volver */}
                <View style={styles.buttonsContainer}>
                  <ButtonHealth
                    title={modoEdicion ? 'Editar Visita' : 'Registrar Visita'}
                    onPress={handleSubmit}
                  />
                  <ButtonHealth
                    title="Volver"
                    onPress={() => navigation.goBack()}
                  />
                </View>
              </View>
            );
          }}
        </Formik>

        {/* Diálogo para Adjuntar Archivo */}
        <Dialog isVisible={attachModalVisible} onBackdropPress={() => setAttachModalVisible(false)}>
        <Formik
          initialValues={{ indicaciones: '' }}
          onSubmit={handleAttachFile}
        >
          {({
            handleChange,
            handleSubmit,
            values,
            touched,
            errors,
          }) => (
            <View>
              <Text style={styles.modalTitle}>Adjuntar Archivo</Text>
              <View style={styles.checkBoxContainer}>
                {['Receta', 'Orden', 'Resultado'].map((type) => (
                  <ButtonHealth
                    key={type}
                    title={type}
                    onPress={() => setSelectedType(type)}
                    style={[
                      styles.modalButton,
                      { backgroundColor: selectedType === type ? '#5BACFF' : 'gray' },
                    ]}
                    size="small"
                  />
                ))}
              </View>
              <TouchableOpacity onPress={pickFile} style={styles.filePicker}>
                <Text>{fileName || 'Seleccionar Archivo'}</Text>
              </TouchableOpacity>
              {fileUri &&
                (fileType.startsWith('image/') ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: fileUri }} style={styles.previewImage} />
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => Linking.openURL(fileUri)}>
                    <Text style={styles.linkText}>Previsualizar Archivo</Text>
                  </TouchableOpacity>
                ))}

              <InputComponent
                placeholder="Indicaciones"
                value={values.indicaciones}
                onChangeText={handleChange('indicaciones')}
                multiline
                errorMessage={touched.indicaciones && errors.indicaciones ? errors.indicaciones : ''}
              />
              <View style={styles.buttonsContainer}>

              <ButtonHealth
                title="Adjuntar"
                onPress={handleSubmit}
                style={styles.attachButton}
              />
              <ButtonHealth
                title="Cancelar"
                onPress={() => setAttachModalVisible(false)}
              />
              </View>
            </View>
          )}
        </Formik>
      </Dialog>
      </ScrollView>

      {/* Alertas Personalizadas */}
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
          alertaVisible: {
            alertaBoolean: false, mensaje: "",
          },
        });

        
        if (alertas.alertaVisible.successNavigation) {
          navigation.navigate("HistoriaMedicaList", { EditadoOAgregado: true });
        }
      },
      style: "default",
    },
  ]}
/>

<AlertCustom
  visible={alertas.alertaVisibleError.alertaBoolean}
  title="¡Error!"
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

    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    backgroundColor: '#fff',
  },
  attachButton: {
    marginTop: 10,
    backgroundColor: '#5BACFF',
  },
  filePreviewContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  linkText: {
    color: '#5BACFF',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  fileName: {
    marginTop: 5,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    gap: 5,
    marginTop: 20,
  },
  dialogContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  modalButton: {
    marginHorizontal: 5,
  },
  filePicker: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#5BACFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  dialogButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  dialogAttachButton: {
    backgroundColor: '#5BACFF',
    flex: 1,
    marginRight: 5,
  },
  dialogCancelButton: {
    backgroundColor: 'gray',
    flex: 1,
    marginLeft: 5,
  },
  pickOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 20,
  },
  option: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  optionText: {
    marginTop: 10,
    fontSize: 16,
    color: "#517fa4",
    textAlign: "center",
  },
});

export default HistoriaMedicaAgregar;
