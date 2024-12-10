import React from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Button, FAB } from '@rneui/themed';
import EntityCard from '../../components/EntityCard';
import SearchComponent from '../../components/SearchComponent';
import NoItems from '../../components/NoItems'; 
import { useInstitucionesData } from './hooks/useInstitucionData';
import { Ionicons } from '@expo/vector-icons';
import ButtonHealth from '../../components/ButtonHealth';

const InstitucionSalud = ({ route, navigation }) => {
  const {
    refreshing,
    buscador,
    setBuscador,
    institucionData,
    loading,
    handleEliminar,
    onRefresh
  } = useInstitucionesData(navigation, route);

  const renderInstitucion = ({ item }) => (
    <EntityCard
      title={item.nombre}
      subtitle1={item.contactos[0]?.telefono || "No disponible"}
      subtitle2={item.contactos[0]?.mailAlternativo || "No disponible"}
      direccion={item.direccion?.direccion || "Dirección no disponible"}
      piso={item.direccion?.piso || "No especificado"}
      departamento={item.direccion?.departamento || "No especificado"}
      onEdit={() => navigation.navigate('AgregarInstitucion', { institucionIndex: item, modoEdicion: true })}
      onDelete={() => handleEliminar(item.id)}
      isInstitucion={true}
    />
  );

  return (
    <View style={styles.container}>
      <SearchComponent
        value={buscador}
        onChangeText={setBuscador}
        placeholder="Buscar institución..."
      />
      <ScrollView 
        contentContainerStyle={institucionData.length === 0 ? styles.centeredContent : null} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator style={styles.loadingIndicator} />
        ) : institucionData.length === 0 ? (
          <View style={styles.centeredContent}>
            <NoItems item="instituciones" />
          </View>
        ) : (
          institucionData
            .filter(institucion => institucion.nombre.toLowerCase().includes(buscador.toLowerCase()))
            .reverse()
            .map((institucion) => renderInstitucion({ item: institucion }))
        )}
      </ScrollView>

      <View style={styles.buttonsContainer}>
      <ButtonHealth
      iconName="add-sharp"
      iconLibrary="Ionicons"
      onPress={() => navigation.navigate('AgregarInstitucion', { modoEdicion: false })}
      style={styles.button}
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
    backgroundColor: '#F0F0F0',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1, 
  },
  buttonsContainer: {
    height: "15%", 
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
  },
  button: {
    marginBottom: 10,
  },
});

export default InstitucionSalud;
