// DocumentPickerComponent.js
import React from 'react';
import { View, Text, Button, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { globalStyles } from '../../assets/themed/globalStyle';
import { Dialog } from '@rneui/base';
import ButtonHealth from '../ButtonHealth';

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
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUriArchivo(result.assets[0].uri);
        setNombreArchivo(result.assets[0].name);
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
        <ButtonHealth title="Adjuntar Documento" onPress={pickFile} />
      </View>
      <View style={styles.checkBoxContainer}>
      {["RECETA", "ORDEN", "RESULTADO", "No adjunto"].map((tipo, index) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.button,
              { backgroundColor: posicionadoCheck === index ? "#5BACFF" : "gray" },
            ]}
            onPress={() => {
              setPosicionadoCheck(index);
              setFieldValue("tipoDocumento", tipo);

              // Si selecciona "NOADJUNTO", limpia el archivo y la imagen
              if (tipo === "NOADJUNTO") {
                setUriArchivo(null);
                setNombreArchivo(null);
              }
            }}
          >
            <Text style={styles.tipoButtonText}>{tipo.charAt(0) + tipo.slice(1).toLowerCase()}</Text>
          </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#5BACFF',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginHorizontal: 5
  },
  tipoButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeText: {
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
  fileText: {
    marginVertical: 10,
    fontSize: 16,
    textAlign: "center",
  },
});

export default DocumentPickerComponent;
