import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '@rneui/themed';
import { Entypo, AntDesign } from '@expo/vector-icons';
import AxiosHealth from '../../Interceptor/AxiosHealth';

const CardCustom = ({ visita, navigation }) => {
  const handleEditar = (visita) => {
    if (visita.activo) {
      navigation.navigate('AgregarVisitaMedica', { visita, modoEdicion: true });
    }
  };

  const handleEliminar = (id) => {
    if (visita.activo) {
      AxiosHealth.put(`visitasMedicas/${id}/desactivar`);
    }
  };

  const handleVerDetalles = (visita) => {

      navigation.navigate('VisitaMedicaDetallada', { visita });

  };

  return (
    <Card containerStyle={[styles.card, !visita.activo && styles.disabledCard]}>
      <View style={styles.cardContent}>
        <Text style={[styles.text, !visita.activo && styles.disabledText]}>Fecha: {visita.fechaVisita}</Text>
        <Text style={[styles.text, !visita.activo && styles.disabledText]}>Institución: {visita.institucionSalud.nombre}</Text>
        <Text style={[styles.text, !visita.activo && styles.disabledText]}>Profesional: {visita.profesional.nombre}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleVerDetalles(visita)}>
            <Entypo name="eye" size={24} color={ 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditar(visita)} disabled={!visita.activo}>
            <AntDesign name="edit" size={24} color={!visita.activo ? 'gray' : 'black'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEliminar(visita.id)} disabled={!visita.activo}>
            <AntDesign name="delete" size={24} color={!visita.activo ? 'gray' : 'black'} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  disabledCard: {
    backgroundColor: '#f0f0f0', 
  },
  cardContent: {
    flexDirection: 'column',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  text: {
    fontSize: 16,
  },
  disabledText: {
    color: 'gray', 
  },
});

export default CardCustom;
