import React, { useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { useProfesional } from './hooks/useProfesional';
import EntityCard from '../../components/EntityCard';
import { Button } from '@rneui/themed';
import NoItems from '../../components/NoItems'; 
import SearchComponent from '../../components/SearchComponent';
import { Ionicons } from '@expo/vector-icons';
import ButtonHealth from '../../components/ButtonHealth';

const ProfesionalSalud = ({ navigation, route }) => {
  const { loading, profesionales, handleEliminarProfesional, fetchData } = useProfesional();
  const [buscador, setBuscador] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    await fetchData();
  };

  useEffect(() => {
    if (route.params?.EditadoOAgregado) {
      fetchData();
      navigation.setParams({ EditadoOAgregado: false });
    }
  }, [route.params?.EditadoOAgregado]);

  const renderProfesional = ({ item }) => (
    <EntityCard
      title={item.nombre} 
      subtitle1={`Teléfono: ${item.contactos[0]?.telefono || "No disponible"}`} 
      subtitle2={`Email: ${item.contactos[0]?.mailAlternativo || "No disponible"}`} 
      isProfesional={true} 
      onEdit={() => navigation.navigate('AgregarProfesional', { profesionalIndex: item, modoEdicion: true })}
      onDelete={() => handleEliminarProfesional(item.id)} 
    />
  );


  if (loading && !refreshing) {
    return <ActivityIndicator style={styles.loadingIndicator} />;
  }

  return (
    <View style={styles.container}>
      <SearchComponent
        value={buscador}
        onChangeText={setBuscador}
        placeholder="Buscar profesional..."
      />
      {profesionales.length === 0 ? (
        <NoItems item="profesionales" />
      ) : (
        <FlatList
          data={profesionales.filter(item => item.nombre.toLowerCase().includes(buscador.toLowerCase()))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProfesional}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <View style={styles.buttonsContainer}>
        <ButtonHealth
          iconName="add-sharp"
          iconLibrary="Ionicons"
          onPress={() => navigation.navigate('AgregarProfesional', { modoEdicion: false })}
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

export default ProfesionalSalud;
