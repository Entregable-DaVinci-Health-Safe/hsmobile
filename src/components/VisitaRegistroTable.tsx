import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Icon } from '@rneui/themed';

interface VisitaRegistroTableProps {
  visita: {
    id: string | number;
    fechaVisita: string;
    institucionSalud: { nombre: string };
    profesional: { nombre: string };
  };
  onView?: () => void;
  onEdit?: () => void;
  onAttach?: () => void;
  onDelete?: () => void;
  disable?: boolean; // Nuevo prop
}

const VisitaRegistroTable: React.FC<VisitaRegistroTableProps> = ({
  visita,
  onView,
  onEdit,
  onAttach,
  onDelete,
  disable = false, // Valor por defecto
}) => {
  return (
    <Card
      containerStyle={[
        styles.cardContainer,
        disable && styles.disabledCardContainer, // Estilo atenuado si está deshabilitado
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, disable && styles.disabledText]}>
          Registro #{visita.id}
        </Text>
        <View style={styles.iconRow}>
          {onView && (
            <TouchableOpacity
              onPress={!disable ? onView : undefined} // Desactiva la acción si está deshabilitado
              disabled={disable} // Propiedad de TouchableOpacity
            >
              <Icon
                name="eye"
                type="entypo"
                color={disable ? '#BDBDBD' : '#517fa4'}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity
              onPress={!disable ? onEdit : undefined}
              disabled={disable}
            >
              <Icon
                name="edit"
                type="antdesign"
                color={disable ? '#BDBDBD' : '#517fa4'}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
          {onAttach && (
            <TouchableOpacity
              onPress={!disable ? onAttach : undefined}
              disabled={disable}
            >
              <Icon
                name="paperclip"
                type="antdesign"
                color={disable ? '#BDBDBD' : '#517fa4'}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={!disable ? onDelete : undefined}
              disabled={disable}
            >
              <Icon
                name="delete"
                type="antdesign"
                color={disable ? '#F5A4A4' : '#D9534F'}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.cellLabel, disable && styles.disabledText]}>
            Fecha
          </Text>
          <View style={styles.divider} />
          <Text style={[styles.cellValue, disable && styles.disabledText]}>
            {visita.fechaVisita}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.cellLabel, disable && styles.disabledText]}>
            Institución
          </Text>
          <View style={styles.divider} />
          <Text style={[styles.cellValue, disable && styles.disabledText]}>
            {visita.institucionSalud.nombre}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.cellLabel, disable && styles.disabledText]}>
            Profesional
          </Text>
          <View style={styles.divider} />
          <Text style={[styles.cellValue, disable && styles.disabledText]}>
            {visita.profesional.nombre}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  disabledCardContainer: {
    backgroundColor: '#F5F5F5', // Fondo atenuado
    borderColor: '#E0E0E0',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#BDBDBD', // Color de texto atenuado
  },
  table: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  cellLabel: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  cellValue: {
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    height: '100%',
    alignSelf: 'stretch',
    marginHorizontal: 10,
  },
  iconRow: {
    flexDirection: 'row',
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default VisitaRegistroTable;
