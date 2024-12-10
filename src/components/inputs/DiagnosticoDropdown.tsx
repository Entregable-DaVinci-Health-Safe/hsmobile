import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { globalStyles } from '../../assets/themed/globalStyle';

const DiagnosticoDropdown = ({
  diagnosticos,
  diagnosticoSeleccionado,
  setDiagnosticoSeleccionado,
  disabled
}) => {
  const handleChange = (item) => {
    setDiagnosticoSeleccionado(item);
  };

  return (

      <Dropdown
        data={diagnosticos}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!disabled ? 'Seleccione un diagnóstico' : 'Cargando...'}
        value={diagnosticoSeleccionado ? diagnosticoSeleccionado.value : null}
        onChange={handleChange}
        disable={disabled}
        search
        searchPlaceholder="Buscar diagnóstico..."
        style={globalStyles.dropdown}
        selectedTextStyle={globalStyles.selectedTextStyle}
        placeholderStyle={globalStyles.placeholderStyle}
        inputSearchStyle={globalStyles.inputSearchStyle}
      />

  );
};



export default DiagnosticoDropdown;
