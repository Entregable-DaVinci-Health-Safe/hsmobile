import React from 'react';
import { ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { Button, Overlay, CheckBox } from '@rneui/themed';
import { Formik } from 'formik';
import { useVacunas } from './hooks/useVacunasList';
import AccordionItem from './item/AccordionItem';
import AlertCustom from '../../components/AlertCustom';
import DropdownComponent from '../../components/inputs/DropdownComponent';
import DatePickerComponent from '../../components/inputs/DatePickerComponent';

const VacunasList = () => {
  const {
    calendarios,
    vacunas,
    selectedVacunas,
    selectedCalendario,
    switchEsProfesional,
    showAlert,
    setShowAlert,
    alertConfirmed,
    modalRegistrar,
    date,
    showDatePicker,
    setSelectedCalendario,
    handleSelectRangoEdad,
    handleSelectVacuna,
    handleCheckProfesional,
    handleAlertConfirm,
    setOpenModalRegistrar,
    setDate,
    setShowDatePicker,
    eliminarVacuna,
    registrarVacuna,
    recargarCalendarios,
  } = useVacunas();

  const getRangoEdadesOptions = () => {
    const calendario = calendarios.find(cal => cal.id === selectedCalendario?.value);
    if (calendario) {
      return calendario.rangoEdades.map(rango => ({
        label: rango.nombre,
        value: rango.id
      }));
    }
    return [];
  };

  const handleEliminarVacuna = async (calendarioId, rangoEdadId, vacunaId) => {
    try {
      await eliminarVacuna(calendarioId, rangoEdadId, vacunaId);
      Alert.alert('Éxito', 'La vacuna se eliminó correctamente');
      await recargarCalendarios();  // Recargar calendarios después de eliminar
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la vacuna. Por favor, intenta nuevamente.');
      console.error('Error eliminando vacuna:', error);
    }
  };

  const formatDate = (date) => date ? date.toISOString().slice(0, 10) : '';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.switchContainer}>
        <CheckBox
          title="Soy personal de salud"
          checked={switchEsProfesional}
          onPress={handleCheckProfesional}
          disabled={alertConfirmed}
        />
      </View>
      <View style={styles.switchContainer}>
        <DropdownComponent
          data={calendarios.map((calendario) => ({ label: `Calendario ${calendario.tipo}`, value: calendario.id }))}
          selectedValue={selectedCalendario}
          setSelectedValue={setSelectedCalendario}
          placeholder="Calendario"
          errorMessage={!selectedCalendario ? 'Debe seleccionar un calendario' : ''}
          disabled={false}
        />
      </View>

      {selectedCalendario && (
        <View>
          <Button onPress={() => setOpenModalRegistrar(true)} title="Registrar vacuna" />
          {calendarios.find(cal => cal.id === selectedCalendario.value)?.rangoEdades
            .filter(rangoEdad => rangoEdad.vacunasAplicadas && rangoEdad.vacunasAplicadas.length > 0) // Solo mostrar rangos con vacunas
            .map(rangoEdad => (
              <View key={rangoEdad.id}>
                <Text style={styles.rangoEdadTitle}>{rangoEdad.nombre}</Text>
                {rangoEdad.vacunasAplicadas.map(vacuna => (
                  <AccordionItem
                    key={vacuna.id}
                    title={vacuna.nombre}
                    isSelected={selectedVacunas.includes(vacuna.id)}
                    onSelect={() => handleSelectVacuna(vacuna.id)}
                  >
                    <View style={styles.accordionDetails}>
                      <Text>Descripción: {vacuna.descripcion}</Text>
                      <Text>Fecha de aplicación: {vacuna.fechaAplicada}</Text>
                      <Text>Dosis: {vacuna.numeroDosis}</Text>
                      <Button
                        radius="sm"
                        type="solid"
                        color="#ff0000"
                        onPress={() =>  Alert.alert(
                          "Confirmar eliminación", 
                          `¿Estás seguro de que deseas eliminar esta vacuna (${vacuna.nombre})?`, 
                          [
                            {
                              text: "Cancelar",
                              style: "cancel",
                            },
                            {
                              text: "Eliminar",
                              onPress: () => handleEliminarVacuna(selectedCalendario.value, rangoEdad.id, vacuna.id),
                              style: "destructive", 
                            },
                          ]
                        )}
                        title="Eliminar"
                      />
                    </View>
                  </AccordionItem>
                ))}
              </View>
            ))}
        </View>
      )}

      <Overlay isVisible={modalRegistrar} onBackdropPress={() => setOpenModalRegistrar(false)} overlayStyle={styles.overlay}>
        <Formik
          initialValues={{ selectedRangoEdad: '', selectedVacuna: '', selectedFecha: '' }}
          onSubmit={async (values) => {
            if (!selectedCalendario) {
              Alert.alert("Error", "Debe seleccionar un calendario antes de registrar una vacuna.");
              return;
            }

            try {
              await registrarVacuna(selectedCalendario.value, values);
              Alert.alert('Éxito', 'Vacuna registrada correctamente');
              setOpenModalRegistrar(false);
              await recargarCalendarios();  // Recargar calendarios después de registrar
            } catch (error) {
              console.error('Error registrando vacuna:', error);
              Alert.alert('Error', 'No se pudo registrar la vacuna. Por favor, intenta nuevamente.');
            }
          }}
        >
          {({ handleSubmit, setFieldValue, values }) => (
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Registro de vacuna</Text>

              <DropdownComponent
                data={getRangoEdadesOptions()}
                selectedValue={values.selectedRangoEdad}
                setSelectedValue={(value) => {
                  handleSelectRangoEdad(value);
                  setFieldValue('selectedRangoEdad', value);
                }}
                placeholder="Rango de edad"
                errorMessage={!values.selectedRangoEdad ? 'Debe seleccionar un rango de edad' : ''}
              />

              <DropdownComponent
                data={vacunas.map((vacuna) => ({ label: vacuna.nombre, value: vacuna.id }))}
                selectedValue={values.selectedVacuna}
                setSelectedValue={(value) => setFieldValue('selectedVacuna', value)}
                placeholder="Vacuna aplicada"
                errorMessage={!values.selectedVacuna ? 'Debe seleccionar una vacuna' : ''}
                disabled={!values.selectedRangoEdad}
              />

              <DatePickerComponent
                date={date}
                setDate={setDate}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                setFieldValue={setFieldValue}
                formatDate={formatDate}
                placeholder="Selecciona la fecha"
                iconName="calendar-today"
                iconLibrary="MaterialIcons"
                errorMessage={!values.selectedFecha ? 'Debe seleccionar una fecha' : ''}
              />

              <View style={styles.cardButtons}>
                <Button 
                  title="Cerrar" 
                  onPress={() => setOpenModalRegistrar(false)} 
                  buttonStyle={styles.deleteButton}
                />
                <Button 
                  title="Guardar" 
                  onPress={() => {
                    setFieldValue("selectedFecha", formatDate(date)); 
                    setShowDatePicker(false);
                    handleSubmit(); 
                  }}
                  buttonStyle={styles.normalButton}
                />
              </View>
            </View>
          )}
        </Formik>
      </Overlay>

      <AlertCustom
  visible={showAlert}
  title="Confirmación"
  message="Esta acción es irreversible. ¿Desea continuar?"
  buttons={[
    {
      text: "Aceptar",
      onPress: () => {
        handleAlertConfirm(); // Ejecuta la acción de confirmación
        setShowAlert(false); // Cierra la alerta
      },
      style: "default", // Estilo predeterminado para confirmación
    },
    {
      text: "Cancelar",
      onPress: () => setShowAlert(false), // Cierra la alerta
      style: "cancel", // Estilo de cancelación
    },
  ]}
/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  switchContainer: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    backgroundColor: '#fff',
  },
  overlay: {
    width: '90%',
    borderRadius: 20,
    padding: 25,
    backgroundColor: '#fff',
  },
  modalContainer: {
    width: '100%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    gap: 10,
  },
  normalButton: {
    width: 120,
    backgroundColor: '#4F8EF7',
    borderRadius: 20,
  },
  deleteButton: {
    backgroundColor: '#FF6961',
    width: 120,
    borderRadius: 20,
  },
  rangoEdadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  accordionDetails: {
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
});

export default VacunasList;
