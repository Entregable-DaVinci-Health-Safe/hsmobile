import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Input } from '@rneui/themed';
import { globalStyles } from '../../assets/themed/globalStyle';

const IndicacionesInput = ({ value, setValue }) => {
  const handleChange = (text) => {
    setValue(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Indicaciones médicas</Text>
      <Input
        placeholder="Escriba las indicaciones aquí"
        multiline={true}
        numberOfLines={4}
        value={value}
        onChangeText={handleChange}
        containerStyle={[globalStyles.containerStyle, { height: 100 }]}
        inputContainerStyle={globalStyles.inputContainerStyle}
        inputStyle={[globalStyles.inputStyle, { textAlignVertical: 'top' }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    paddingBottom: 5,
  },
});

export default IndicacionesInput;
