import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ListItem, Chip, Button, Icon, Divider } from '@rneui/themed';

const VacunaItem = ({ vacuna, calendarioId, rangoEdadId, isSelected, onSelect, eliminarVacuna }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <ListItem.Accordion
        content={
          <>
            <ListItem.Content>
              <ListItem.Title style={styles.title}>{vacuna.nombre}</ListItem.Title>
            </ListItem.Content>
            <Chip
              title={vacuna.aplicada}
              icon={{
                name: 'check',
                type: 'font-awesome',
                size: 20,
                color: 'white',
              }}
              containerStyle={styles.chipContainer}
            />
          </>
        }
        isExpanded={expanded}
        onPress={() => setExpanded(!expanded)}
        onLongPress={onSelect}
        containerStyle={[styles.accordionContainer, isSelected ? styles.selectedAccordion : null]}
      >
        {expanded && (
          <View style={styles.accordionDetails}>
            <Text style={styles.description}>Descripción: {vacuna.descripcion}</Text>
            <Divider />
            <Text style={styles.detailText}>Fecha de aplicación: {vacuna.fechaAplicada}</Text>
            <Divider />
            <Text style={styles.detailText}>Dosis: {vacuna.numeroDosis}/X</Text>
            <Divider />
            <View style={styles.buttonContainer}>
              <Button
                radius="sm"
                type="solid"
                color="red"
                onPress={() =>
                  Alert.alert(
                    'Eliminar',
                    `¿Está seguro que desea eliminar a ${vacuna.nombre}?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Aceptar', onPress: () => eliminarVacuna(calendarioId, rangoEdadId, vacuna.id) },
                    ]
                  )
                }
              >
                Eliminar
                <Icon name="delete" color="white" />
              </Button>
            </View>
          </View>
        )}
      </ListItem.Accordion>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chipContainer: {
    marginLeft: 10,
  },
  accordionContainer: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  selectedAccordion: {
    backgroundColor: '#e0e0e0',
  },
  accordionDetails: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
});

export default VacunaItem;
