import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking, Modal } from 'react-native';
import { Button, Divider } from '@rneui/base';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import AxiosHealth from '../../Interceptor/AxiosHealth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FilterModal from '../../components/filter/FilterModal';
import VacunaItem from '../../components/items/VacunaItem';
import NoItems from '../../components/NoItems';
import ButtonHealth from '../../components/ButtonHealth';
import GeneratePdf, { createAndSavePDF } from '../temp_muestra/generatePdf';
import { useLoading } from '../../components/LoadingContext';

const Informes = ({ route, navigation }) => {
  const [informes, setInformes] = useState([]);
  const [calendarios, setCalendarios] = useState([]);
  const { setLoading } = useLoading();

  const [error, setError] = useState(null);
  const [filterState, setFilterState] = useState('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('Historia médica');
  const [prescriptionsModalVisible, setPrescriptionsModalVisible] = useState(false);
  const [currentPrescriptions, setCurrentPrescriptions] = useState([]);

  const fetchVisitasMedicas = async () => {
    setLoading(true);
    try {
      const hcIdIntegrante = route.params?.hcIdIntegrante;
      const idHc = hcIdIntegrante || (await AsyncStorage.getItem('idHc'));
      const response = await AxiosHealth.get(`historiasMedicas/${idHc}/visitasMedicasWithDocuments`);
      setInformes(response.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarios = async () => {
    setLoading(true);
    try {
      const hcIdIntegrante = route.params?.hcIdIntegrante;
      const idHc = hcIdIntegrante || (await AsyncStorage.getItem('idHc'));
      const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/calendarios`);
      setCalendarios(response.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReportType === 'Historia médica') {
      fetchVisitasMedicas();
    } else if (selectedReportType === 'Vacunas') {
      fetchCalendarios();
    }
  }, [selectedReportType]);

  const deleteDocument = async (option) => {
    try {
      await AxiosHealth.put(`/visitasMedicas/${option.id}/desactivar`);
      await fetchVisitasMedicas();
      Alert.alert('Eliminado', 'El documento ha sido eliminado exitosamente.');
    } catch (error) {
      console.error('Error eliminando documento:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar el documento.');
    }
  };

  const confirmDeleteDocument = (option) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar este documento (${option.tipo})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => deleteDocument(option), style: 'destructive' },
      ]
    );
  };

  const openPrescriptionsModal = (prescriptions) => {
    setCurrentPrescriptions(prescriptions);
    setPrescriptionsModalVisible(true);
  };

  const handlePrintAll = () => {
    
    const data = informes
      .filter((doc) =>
        filterState === 'todos' ||
        (filterState === 'activas' && doc.activo) ||
        (filterState === 'inactivas' && !doc.activo)
      ) 
      .map((informe) => {
        return {
          fechaVisita: informe.fechaVisita || 'Fecha no disponible',
          activo: informe.activo ? 'Activo' : 'Inactivo',
          prescripciones: (informe.prescripciones || []).map((prescripcion) => ({
            pais: prescripcion.pais || 'País no especificado',
            estudios: (prescripcion.estudios || []).map((estudio) => ({
              tipo: estudio.tipo || 'Tipo no especificado',
              descripcion: estudio.descripcion || 'Sin descripción',
              fecha: estudio.fecha || 'Sin fecha',
              url: estudio.url || 'Sin URL',
            })),
            recetas: (prescripcion.recetas || []).map((receta) => ({
              tipo: receta.tipo || 'Tipo no especificado',
              descripcion: receta.descripcion || 'Sin descripción',
              fecha: receta.fecha || 'Sin fecha',
              url: receta.url || 'Sin URL',
            })),
          })),
        };
      });
  
    
    const fileName =
      filterState === 'todos'
        ? 'todos_los_informes'
        : filterState === 'activas'
        ? 'informes_activos'
        : 'informes_inactivos';
  
    createAndSavePDF({ informes: data }, fileName);
  };
  
  const renderDocument = ({ item }) => {
    const isInactive = !item.activo;

    return (
      <View style={[styles.card, isInactive && styles.disabledCard]}>
        <View style={styles.row}>
          <Text style={[styles.label, isInactive && styles.disabledText]}>Fecha de visita:</Text>
          <Text style={[styles.value, isInactive && styles.disabledText]}>{item.fechaVisita}</Text>
        </View>
        <Divider />
        <View>
          <Text style={[styles.label, isInactive && styles.disabledText]}>País:</Text>
          <Text style={[styles.value, isInactive && styles.disabledText]}>
            {item.prescripciones?.[0]?.pais || 'País no disponible'}
          </Text>
        </View>
        <Divider />
        <View style={styles.row}>
          <Text style={[styles.label, isInactive && styles.disabledText]}>Descripción:</Text>
          <Text style={[styles.value, isInactive && styles.disabledText]}>
            {item.prescripciones?.[0]?.recetas?.[0]?.descripcion || 'Sin descripción'}
          </Text>
        </View>
        <Divider />
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, isInactive && styles.disabledButton]}
            onPress={() => openPrescriptionsModal(item.prescripciones)}
            disabled={isInactive}
          >
            <Entypo name="eye" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButtonDelete, isInactive && styles.disabledButton]}
            onPress={() => confirmDeleteDocument({ id: item.id, tipo: 'Visita Médica' })}
            disabled={isInactive}
          >
            <MaterialIcons name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCalendarios = () => {
    if (calendarios.length > 0) {
      return calendarios.map((calendario) => {
        const vacunasAplicadasExistentes = calendario.rangoEdades.some(
          (rangoEdad) => rangoEdad.vacunasAplicadas.length > 0
        );

        if (!vacunasAplicadasExistentes) {
          return <Text key={calendario.id} style={styles.noDataText}>No hay calendarios disponibles para {calendario.tipo.toLowerCase()}.</Text>;
        }

        return (
          <View key={calendario.id}>
            <Text style={styles.calendarioTitle}>Calendario de {calendario.tipo.toLowerCase()}</Text>
            {calendario.rangoEdades.map((objetoVacuna) =>
              objetoVacuna.vacunasAplicadas.length > 0
                ? objetoVacuna.vacunasAplicadas.map((aplicada) => (
                    <VacunaItem
                      key={aplicada.id}
                      vacuna={aplicada}
                      calendarioId={calendario.id}
                      rangoEdadId={objetoVacuna.id}
                      isSelected={false}
                      onSelect={() => console.log('onselect')}
                      fetchCalendarios={fetchCalendarios}
                    />
                  ))
                : null
            )}
          </View>
        );
      });
    }
    return <NoItems item="calendarios" />;
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Al parecer no hay informes disponibles.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ButtonHealth onPress={() => setModalVisible(true)} title='Filtros' style={{marginBottom: 10}}/>
      
      {selectedReportType === 'Historia médica' ? (
        <FlatList
          data={informes.filter(
            (doc) =>
              filterState === 'todos' ||
              (filterState === 'activas' && doc.activo) ||
              (filterState === 'inactivas' && !doc.activo)
          )}
          renderItem={renderDocument}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<NoItems item="documentos" />}
        />
      ) : (
        renderCalendarios()
      )}
  
      {selectedReportType === 'Historia médica' && (
        <View style={styles.buttonsContainer}>
          <ButtonHealth
            iconName="print"
            iconLibrary="FontAwesome5"
            title="Imprimir todos los informes"
            onPress={handlePrintAll}
          />
        </View>
      )}
  
      {/* Modal para Filtros Existente */}
      <FilterModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApplyFilters={(filters) => {
          setSelectedReportType(filters.tipoInforme || 'Historia médica');
          setFilterState(filters.estado || 'todos');
        }}
        availableFilters={['tipoInforme', 'estado', 'fechas']}
      />

      {/* Nuevo Modal para Listar URLs */}
      <Modal
        visible={prescriptionsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPrescriptionsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Documento</Text>
            <ScrollView>
              {currentPrescriptions.map((prescription) => (
                <View key={prescription.id} style={styles.prescriptionSection}>
                  <Text style={styles.prescriptionTitle}>Prescripción {prescription.id} - {prescription.pais}</Text>
                  
                  {/* Estudios */}
                  <Text style={styles.subTitle}>Estudios</Text>
                  {prescription.estudios.map((estudio) => (
                    <View key={estudio.id} style={styles.documentRow}>
                      <Text style={styles.documentText}>{estudio.descripcion} ({estudio.tipo})</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(estudio.url)}>
                        <Entypo name="eye" size={24} color="#4F8EF7" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Recetas */}
                  <Text style={styles.subTitle}>Recetas</Text>
                  {prescription.recetas.map((receta) => (
                    <View key={receta.id} style={styles.documentRow}>
                      <Text style={styles.documentText}>{receta.descripcion} ({receta.tipo})</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(receta.url)}>
                        <Entypo name="eye" size={24} color="#4F8EF7" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
            <ButtonHealth onPress={() => setPrescriptionsModalVisible(false)} title="Cerrar" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  modalButton: {
    backgroundColor: '#4F8EF7', 
    paddingVertical: 12,
    borderRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  disabledCard: {
    backgroundColor: "#e0e0e0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    color: "#666",
  },
  disabledText: {
    color: "#a0a0a0",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#4F8EF7",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    flex: 1,
  },
  actionButtonDelete: {
    backgroundColor: "#FF6961",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: "#c0c0c0",
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  prescriptionItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    marginLeft: 10,
    color: '#fff',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  calendarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 10,
    justifyContent: 'space-around',
  },

  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  prescriptionSection: {
    marginBottom: 20,
  },
  prescriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  documentText: {
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
});

export default Informes;
