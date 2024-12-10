import React from 'react';
import { Button, View, StyleSheet, Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { createHtmlTemplate } from './pdfTemplate';
import { useLoading } from '../../components/LoadingContext';
export const createAndSavePDF = async (data, fileName) => {
  try {

    const htmlContent = createHtmlTemplate(data);
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      width: 595.28,
      height: 841.89,
      base64: false,
    });

    const fileUri = `${FileSystem.documentDirectory}${fileName}.pdf`;

    await FileSystem.moveAsync({
      from: uri,
      to: fileUri,
    });

    Alert.alert(
      'PDF Creado',
      '¿Quieres guardar o ver el PDF?',
      [
        {
          text: 'Guardar',
          onPress: () => Alert.alert('PDF guardado en la memoria del dispositivo'),
          style: 'cancel',
        },
        {
          text: 'Ver',
          onPress: async () => {
            if (Platform.OS === 'ios') {
              await Sharing.shareAsync(fileUri);
            } else if (Platform.OS === 'android') {
              await FileSystem.getContentUriAsync(fileUri).then((cUri) => {
                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                  data: cUri,
                  flags: 1,
                });
              });
            }
          },
        },
      ],
      { cancelable: false }
    );

    return fileUri;
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Ocurrió un error al crear el PDF');
    return null;
  }
};

export default createAndSavePDF;
