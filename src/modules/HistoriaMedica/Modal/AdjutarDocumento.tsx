// DocumentPickerComponent.js
import React from 'react';
import { View, Text, Button, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Dialog } from '@rneui/base';

const DocumentPickerComponent = ({
  nombreArchivo,
  setNombreArchivo,
  uriArchivo,
  setUriArchivo,
  setDialogVisible,
  dialogVisible,
  posicionadoCheck,
  setPosicionadoCheck,
  setFieldValue
}) => {

  React.useEffect(() => {
    setFieldValue("tipoDocumento", "Receta");
    setPosicionadoCheck(0);
  }, [setFieldValue, setPosicionadoCheck]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled && result.uri) {
        setUriArchivo(result.uri);
        setNombreArchivo(result.name);
      }
    } catch (error) {
      console.error("Error al seleccionar el archivo:", error);
    }
  };

  return (
    <>
      <View style={{ justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
        {nombreArchivo && (
          <Text>Archivo a subir: {nombreArchivo}</Text>
        )}
        {uriArchivo && uriArchivo.match(/\.(jpeg|jpg|gif|png)$/) && (
          <TouchableOpacity onPress={() => setDialogVisible(true)}>
            <Image
              source={{ uri: uriArchivo }}
              style={{ width: 100, height: 100, marginVertical: 20 }}
            />
          </TouchableOpacity>
        )}
        <Button title="Adjuntar Documento" onPress={pickFile} />
      </View>
      <View style={styles.checkBoxContainer}>
        {['Receta', 'Estudio', 'Resultado'].map((tipo, index) => (
          <Button
            key={tipo}
            title={tipo}
            onPress={() => {
              setPosicionadoCheck(index);
              setFieldValue("tipoDocumento", tipo);
            }}
            color={posicionadoCheck === index ? "blue" : "gray"}
          />
        ))}
      </View>
      <Dialog isVisible={dialogVisible} onBackdropPress={() => setDialogVisible(false)}>
        <View>
          <TouchableOpacity onPress={() => setDialogVisible(false)}>
            <Text>Cerrar</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: uriArchivo }}
            style={{ width: 280, height: 280, marginTop: 20 }}
          />
        </View>
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  checkBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  }
});

export default DocumentPickerComponent;
