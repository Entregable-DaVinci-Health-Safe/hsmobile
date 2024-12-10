import React, { useState } from 'react';
import { View, Button, StyleSheet, Text, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

const FilterModal = ({ isVisible, onClose, onApplyFilters, availableFilters }) => {
  const initialFilters = {
    tipoInforme: 'Historia médica',
    estado: 'todos',
    fechaInicio: null,
    fechaFin: null,
    especialidad: '',
    institucionSalud: '',
    profesional: '',
    diagnostico: ''
  };

  const [filters, setFilters] = useState(initialFilters);
  const [showDatePicker, setShowDatePicker] = useState({ start: false, end: false });

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const onChangeFechaInicio = (event, selectedDate) => {
    const currentDate = selectedDate || filters.fechaInicio;
    setShowDatePicker({ ...showDatePicker, start: false });
    setFilters({ ...filters, fechaInicio: currentDate });
  };

  const onChangeFechaFin = (event, selectedDate) => {
    const currentDate = selectedDate || filters.fechaFin;
    setShowDatePicker({ ...showDatePicker, end: false });
    setFilters({ ...filters, fechaFin: currentDate });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="slideInDown"
      animationOut="slideOutUp"
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        {availableFilters.includes('tipoInforme') && (
          <>
            <Text style={styles.label}>Tipos de informes</Text>
            <Dropdown
              style={styles.dropdown}
              data={[
                { label: 'Historia médica', value: 'Historia médica' },
                { label: 'Vacunas', value: 'Vacunas' }
              ]}
              labelField="label"
              valueField="value"
              placeholder="Seleccionar tipo de informes"
              value={filters.tipoInforme}
              onChange={(item) => setFilters({ ...filters, tipoInforme: item.value })}
            />
          </>
        )}

        {availableFilters.includes('estado') && (
          <>
            <Text style={styles.label}>Estados</Text>
            <Dropdown
              style={styles.dropdown}
              data={[
                { label: 'Todos', value: 'todos' },
                { label: 'Visitas activas', value: 'activas' },
                { label: 'Visitas inactivas', value: 'inactivas' }
              ]}
              labelField="label"
              valueField="value"
              placeholder="Seleccionar estado"
              value={filters.estado}
              onChange={(item) => setFilters({ ...filters, estado: item.value })}
            />
          </>
        )}

        {availableFilters.includes('fechas') && (
          <>
            <Text style={styles.label}>Fecha inicio</Text>
            <TextInput
              style={styles.dateInput}
              value={formatDate(filters.fechaInicio)}
              onFocus={() => setShowDatePicker({ ...showDatePicker, start: true })}
              placeholder="Seleccionar fecha inicio"
            />
            {showDatePicker.start && (
              <DateTimePicker
                value={filters.fechaInicio || new Date()}
                mode="date"
                display="default"
                onChange={onChangeFechaInicio}
              />
            )}

            <Text style={styles.label}>Fecha fin</Text>
            <TextInput
              style={styles.dateInput}
              value={formatDate(filters.fechaFin)}
              onFocus={() => setShowDatePicker({ ...showDatePicker, end: true })}
              placeholder="Seleccionar fecha fin"
            />
            {showDatePicker.end && (
              <DateTimePicker
                value={filters.fechaFin || new Date()}
                mode="date"
                display="default"
                onChange={onChangeFechaFin}
              />
            )}
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Aplicar Filtros" onPress={applyFilters} />
          <Button title="Limpiar Filtros" onPress={clearFilters} color="gray" />
        </View>
        <Button title="Cerrar" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-start',
    margin: 0
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    alignItems: 'center',
    borderRadius: 20,
    borderTopEndRadius: 0,
    borderTopStartRadius: 0,
    shadowColor: 'transparent',
    elevation: 0,
    overflow: 'hidden'
  },
  title: {
    fontSize: 20,
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    marginBottom: 10
  },
  dateInput: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5
  },
  dropdown: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  }
});

export default FilterModal;