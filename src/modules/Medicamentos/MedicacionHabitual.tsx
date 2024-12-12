// screens/MedicacionHabitual.js
import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, RefreshControl } from 'react-native';
import useMedicamentos from './hook/useMedicamentos';
import EntityCard from '../../components/EntityCard';
import { Button } from '@rneui/base';
import { Ionicons } from '@expo/vector-icons';
import NoItems from '../../components/NoItems';
import ButtonHealth from '../../components/ButtonHealth';

const MedicacionHabitual = ({ route, navigation }) => {
  const { medicamentos, loading, deleteMedicamento, error, forceUpdate } = useMedicamentos();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    forceUpdate();
    setRefreshing(false);
  }, [forceUpdate]);

  const handleEdit = (medicamento) => {
    navigation.navigate('AgregarMedicacion', {
      medicacionIndex: medicamento,
      modoEdicion: true,
    });
  };

  useEffect(() => {
    if (route.params?.EditadoOAgregado) {
        forceUpdate();
        navigation.setParams({ EditadoOAgregado: false });
    }
}, [route.params?.EditadoOAgregado]);
  
return (
  <View style={styles.container}>
    {loading ? (
      <ActivityIndicator size="large" color="#0000ff" />
    ) : medicamentos.length === 0 ? ( // Verificamos directamente si hay elementos en la lista
      <NoItems item={'una medicación'} />
    ) : (
      <FlatList
        data={medicamentos}
        renderItem={({ item }) => (
          <EntityCard
            title={item.medicamento.nombre ? item.medicamento.nombre : 'Nombre no disponible'}
            subtitle1={item.medicamento.producto.nombre ? item.medicamento.producto.nombre : 'Producto no disponible'}
            comentarios={item.comentarios}
            isMedicamentos={true}
            onEdit={() => handleEdit(item)}
            onDelete={() => deleteMedicamento(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    )}

    <View style={styles.buttonsContainer}>
      <ButtonHealth
        iconName="add-sharp"
        iconLibrary="Ionicons"
        onPress={() => navigation.navigate('AgregarMedicacion')}
        style={styles.button}
      />
      <ButtonHealth
        title="Volver"
        onPress={() => navigation.goBack()}
        style={styles.button}
      />
    </View>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,

  },
  button: {
    marginBottom: 10,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  buttonsContainer: {
    height: "15%",
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
  },
});

export default MedicacionHabitual;
