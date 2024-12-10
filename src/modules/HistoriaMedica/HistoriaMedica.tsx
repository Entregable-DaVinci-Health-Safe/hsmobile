import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  RefreshControl, 
  Text, 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  Linking, 
  Alert 
} from 'react-native';
import ButtonHealth from '../../components/ButtonHealth';
import VisitaRegistroTable from '../../components/VisitaRegistroTable';
import { useVisitasMedicas } from './hooks/useVisitaMedica';
import FilterModal from '../../components/filter/FilterModal';
import { Dialog } from '@rneui/themed';
import NoItems from '../../components/NoItems';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AxiosHealth from '../../Interceptor/AxiosHealth';
import { Formik } from 'formik';
import * as yup from 'yup';
import InputComponent from '../../components/inputs/InputComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoriaMedica = ({ route, navigation }) => {
  
  const { hcIdIntegrante } = route.params || {};
  
  
  const { visitasMedicas, loading, handleEliminarVisita, manejarVisitaMedica, onRefresh } = useVisitasMedicas(hcIdIntegrante);

  const [modalVisible, setModalVisible] = useState(false);
  const [filteredVisitas, setFilteredVisitas] = useState([]);
  const [filters, setFilters] = useState({ estado: 'activas' });

  
  const [attachModalVisible, setAttachModalVisible] = useState(false);
  const [selectedVisita, setSelectedVisita] = useState(null);
  const [selectedType, setSelectedType] = useState('Receta');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    
    const activeVisitas = visitasMedicas.filter(visita => visita.activo);
    setFilteredVisitas(activeVisitas);
  }, [visitasMedicas]);

  const applyFilters = (appliedFilters) => {
    setFilters(appliedFilters);
  
    const filtered = visitasMedicas.filter((visita) => {
      let matches = true;
  
      
      if (appliedFilters.estado && appliedFilters.estado !== 'todos') {
        const isActive = appliedFilters.estado === 'activas';
        matches = matches && visita.activo === isActive; 
      }
  
      
      if (appliedFilters.fechaInicio) {
        matches = matches && new Date(visita.fechaVisita) >= new Date(appliedFilters.fechaInicio);
      }
      if (appliedFilters.fechaFin) {
        matches = matches && new Date(visita.fechaVisita) <= new Date(appliedFilters.fechaFin);
      }
  
      return matches;
    });
  
    setFilteredVisitas(filtered);
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

  const subirImagen = async () => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const uniqueName = `Documento_${new Date().getTime()}`;
      const storageRef = ref(getStorage(), `prescripciones/${uniqueName}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error al subir la imagen a Firebase:', error);
      throw error;
    }
  };

  const handleAttachFile = async (values) => {
    const currentIdHc = hcIdIntegrante || (await AsyncStorage.getItem('idHc'));
    
    if (!currentIdHc) {
      Alert.alert("Error", "No se pudo determinar el ID de historia clínica.");
      return;
    }

    if (!fileUri) {
      alert('Por favor selecciona un archivo.');
      return;
    }

    try {
      setIsLoading(true);
      const url = await subirImagen(); 

      if (selectedType === 'Orden' || selectedType === 'Resultado') {
        await AxiosHealth.post(
          `/prescripcion/${selectedVisita}/crearEstudio`,
          {
            tipo: selectedType,
            url: url,
            descripcion: values.indicaciones,
            hcId: currentIdHc, 
          }
        );
      } else if (selectedType === 'Receta') {
        await AxiosHealth.post(
          `/prescripcion/${selectedVisita}/crearReceta`,
          {
            tipo: selectedType,
            url: url,
            descripcion: values.indicaciones,
            hcId: currentIdHc, 
          }
        );
        onRefresh();
      }

      setAttachModalVisible(false);
      setFileName('');
      setFileUri('');
      setFileType('');
      onRefresh();

      Alert.alert(
        'Éxito',
        'Adjuntada correctamente.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error al adjuntar archivo:', error);
      Alert.alert('Error', 'Ocurrió un error al adjuntar el archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAttachModal = (visitaId) => {
    setSelectedVisita(visitaId);
    setAttachModalVisible(true);
  };

  const validationSchema = yup.object().shape({
    indicaciones: yup.string().required('Las indicaciones son requeridas.'),
  });

  return (
    <View style={styles.container}>
      <ButtonHealth onPress={() => setModalVisible(true)} title="Filtrar" style={styles.button} />
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        contentContainerStyle={filteredVisitas.length === 0 ? styles.centeredContent : null}
      >


        {filteredVisitas.length > 0 ? (
          filteredVisitas.map((visita, index) => (
            <VisitaRegistroTable
              key={index}
              visita={visita}
              onView={() => navigation.navigate("Historia Medica", {
                screen: "VisitaMedicaDetallada",
                params: { visita: visita },
              })}
              onEdit={() => navigation.navigate('AgregarVisitaMedica', { visita, modoEdicion: true })}
              onAttach={() => handleOpenAttachModal(visita.id)}
              onDelete={() => handleEliminarVisita(visita.id)}
              disable={!visita.activo}
            />
          ))
        ) : (
          <NoItems item="visitas médicas" />
        )}
      </ScrollView>
      <FilterModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApplyFilters={applyFilters}
        availableFilters={['estado', 'fechas']}
      />

      <Dialog isVisible={attachModalVisible} onBackdropPress={() => setAttachModalVisible(false)}>
        <Formik
          initialValues={{ indicaciones: '' }}
          validationSchema={validationSchema}
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

              <ButtonHealth
                title="Adjuntar"
                onPress={handleSubmit}
                style={styles.attachButton}
                disabled={isLoading}
              />
              <ButtonHealth
                title="Cancelar"
                onPress={() => setAttachModalVisible(false)}
                style={styles.cancelButton}
              />
            </View>
          )}
        </Formik>
      </Dialog>

      <View style={styles.buttonsContainer}>
        <ButtonHealth
          iconName="add-sharp"
          iconLibrary="Ionicons"
          onPress={() => navigation.navigate("AgregarVisitaMedica", { modoEdicion: false })}
        />
        <ButtonHealth
          title="Volver"
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imagePreviewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  modalButton: {
    marginHorizontal: 5,
    borderRadius: 5,
    padding: 10,
  },
  filePicker: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  previewImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  linkText: {
    color: '#5BACFF',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginVertical: 10,
  },
  attachButton: {
    backgroundColor: '#5BACFF',
    marginVertical: 10,
  },
  cancelButton: {
    backgroundColor: '#5BACFF',
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginBottom: 10,
  },
  buttonsContainer: {
    height: "15%", 
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
  },
});

export default HistoriaMedica;
