import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Button, Chip, Divider, Icon, ListItem } from '@rneui/themed';
import { globalStyles } from '../../assets/themed/globalStyle';
import AxiosHealth from '../../Interceptor/AxiosHealth';

const VacunaItem = ({ vacuna, calendarioId, rangoEdadId, isSelected, onSelect, fetchCalendarios }) => {
    const eliminarVacuna = async () => {
      try {
        await AxiosHealth.delete(`/calendarios/${calendarioId}/rangoEdades/${rangoEdadId}/vacunas/${vacuna.id}`);
        
        // Recargar los datos de calendarios
        await fetchCalendarios();
        
        Alert.alert('Eliminado', 'La vacuna ha sido eliminada exitosamente.');
      } catch (error) {
        console.error('Error eliminando vacuna:', error);
        Alert.alert('Error', 'Hubo un problema al eliminar la vacuna.');
      }
    };
    
      const AccordionItem = ({ title, children, isSelected, onSelect }) => {
        const [expanded, setExpanded] = React.useState(false);
    
        return (
          <View>
            <ListItem.Accordion
              content={
                <>
                  <ListItem.Content>
                    <ListItem.Title>{title}</ListItem.Title>
                  </ListItem.Content>
                </>
              }
              isExpanded={expanded}
              onPress={() => setExpanded(!expanded)}
              onLongPress={onSelect}
              containerStyle={[globalStyles.accordionContainer, isSelected ? globalStyles.selectedAccordion : null]}
            >
              {expanded && children}
            </ListItem.Accordion>
          </View>
        );
      };
      

  return (
    <AccordionItem
      title={
        <View style={globalStyles.vacunaItemContent}>
          <Text style={globalStyles.vacunaText}>{vacuna.nombre}</Text>
          <View>
            <Chip
              title={vacuna.aplicada ? 'Aplicada' : 'Pendiente'}
              icon={{
                name: vacuna.aplicada ? 'check' : 'times',
                type: 'font-awesome',
                size: 20,
                color: 'white',
              }}
              containerStyle={globalStyles.chipContainer}
              buttonStyle={{
                backgroundColor: vacuna.aplicada ? 'green' : 'red'
              }}
            />
          </View>
        </View>
      }
      isSelected={isSelected}
      onSelect={onSelect}
    >
      <View style={globalStyles.accordionDetails}>
        <Text>Descripción: {vacuna.descripcion}</Text>
        <Divider style={globalStyles.divider} />
        <Text>Fecha de aplicación: {vacuna.fechaAplicada || 'No disponible'}</Text>
        <Divider style={globalStyles.divider} />
        <Text>Dosis: {vacuna.numeroDosis || 1}/X</Text>
        <Divider style={globalStyles.divider} />
        <View>
          <Button
            radius={"sm"}
            type="solid"
            color="red"
            onPress={() => Alert.alert(
                'Eliminar',
                `¿Está seguro que desea eliminar a ${vacuna.nombre}?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Aceptar', onPress: eliminarVacuna }
                ]
              )}
          >
            Eliminar
            <Icon name="delete" color="white" />
          </Button>
        </View>
      </View>
    </AccordionItem>
  );
};

export default VacunaItem;
