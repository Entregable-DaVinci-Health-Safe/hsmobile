import React, { useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import useMedicamentos from './hook/useMedicamentos';
import EntityCard from '../../components/EntityCard';
import ButtonHealth from '../../components/ButtonHealth';
import NoItems from '../../components/NoItems';
import { useFocusEffect } from '@react-navigation/native';

const MedicacionHabitual = ({ navigation }) => {
  const { medicamentos, loading, deleteMedicamento, error, forceUpdate } = useMedicamentos();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const updateData = async () => {
        setRefreshing(true);
        try {
          await forceUpdate();
        } catch (err) {
          console.error(err);
        } finally {
          setRefreshing(false);
        }
      };
      updateData();
    }, [forceUpdate])
  );

  const onRefresh = useCallback(() => {
    const refresh = async () => {
      setRefreshing(true);
      try {
        await forceUpdate();
      } catch (err) {
        console.error(err);
      } finally {
        setRefreshing(false);
      }
    };
    refresh();
  }, [forceUpdate]);

  const handleEdit = (medicamento) => {
    navigation.navigate('AgregarMedicacionHabitutal', { 
      medicacionIndex: medicamento,
      modoEdicion: true,
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <NoItems item="una medicación" />
      ) : (
        <FlatList
          data={medicamentos}
          renderItem={({ item }) => (
            <EntityCard
              title={item.medicamento.nombre || 'Nombre no disponible'}
              subtitle1={item.medicamento.producto.nombre || 'Producto no disponible'}
              comentarios={item.comentarios}
              isMedicamentos={true}
              onEdit={() => handleEdit(item)}
              onDelete={() => deleteMedicamento(item.id)}
              onReminder={() => handleEdit(item)}
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
  buttonsContainer: {
    height: '15%',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
  },
});

export default MedicacionHabitual;
