// src/modules/Usuario/FotoPerfil.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { Avatar, Button, Card } from '@rneui/themed';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AxiosHealth from '../../Interceptor/AxiosHealth';
import { cargarPerfilDesdeAPI, eliminarPerfilDeLocalStorage, obtenerIniciales, obtenerPerfilDeLocalStorage } from '../../assets/utils/utils';
import { useLoading } from '../../components/LoadingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventBus from '../../assets/utils/EventBust';
interface PerfilDatos {
  activo: boolean;
  apellido: string;
  fechaNacimiento: string;
  genero: string;
  id: number;
  imgPerfil: string | null;
  mail: string;
  nombre: string;
}

const FotoPerfil: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [perfilDatos, setPerfilDatos] = useState<PerfilDatos | null>(null);
  const { setLoading } = useLoading();
  const [forceUpdate, setForceUpdate] = useState(0);

  const tieneImagen = perfilDatos && perfilDatos.imgPerfil;

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere acceso a la galería para seleccionar una imagen.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri; // Obtener la URI de la imagen seleccionada
        await uploadImage(imageUri); // Pasar la URI a la función de carga
      } else {
        Alert.alert('Cancelado', 'No se seleccionó ninguna imagen.');
      }

      // Opcional: Cargar perfil nuevamente si es necesario
      // cargarPerfilDesdeAPI();
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      Alert.alert('Error', 'Hubo un problema al seleccionar la imagen.');
    }
  };

  const uploadImage = async (imageUri: string) => {
    if (!imageUri) {
      Alert.alert('Error', 'No se seleccionó ninguna imagen.');
      return;
    }
  
    try {
      setLoading(true);
  
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const uniqueImageName = `image_${Date.now()}`;
      const storage = getStorage();
      const storageRef = ref(storage, `images/${uniqueImageName}`);
  
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
  
      await AxiosHealth.put(`/usuarios/actualizarImagen`, {
        imgPerfil: downloadURL,
      });
  
      // Actualizar AsyncStorage con la nueva imagen
      const perfilUsuario = await AsyncStorage.getItem('PerfilUsuario');
      if (perfilUsuario) {
        const perfilObj = JSON.parse(perfilUsuario);
        perfilObj.imgPerfil = downloadURL;
        await AsyncStorage.setItem('PerfilUsuario', JSON.stringify(perfilObj));
        setPerfilDatos(perfilObj);
      }
  
      // Emitir el evento para notificar a CustomHeader
      eventBus.emit('perfilActualizado');
  
      // Forzar actualización en el Avatar
      setForceUpdate((prev) => prev + 1);
  
      Alert.alert('Éxito', 'La imagen de perfil se actualizó correctamente.');
    } catch (error: any) {
      console.error('Error al subir la imagen:', error);
      Alert.alert('Error', 'Hubo un problema al subir la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const recargarDatosPerfil = async () => {
    setLoading(true);
    try {
      let datosPerfil = await obtenerPerfilDeLocalStorage();
      if (!datosPerfil) {
        datosPerfil = await cargarPerfilDesdeAPI();
      }
      setPerfilDatos(datosPerfil);
      setForceUpdate((prev) => prev + 1);
    } catch (error) {
      console.error('Error al recargar datos del perfil:', error);
      Alert.alert('Error', 'Hubo un problema al recargar los datos del perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recargarDatosPerfil();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Card>
        <View style={{ marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
          {perfilDatos ? (
            <Avatar
              size={125}
              key={forceUpdate} // Cambiar la key para forzar el re-render
              rounded
              title={!tieneImagen ? obtenerIniciales(perfilDatos.nombre, perfilDatos.apellido) : ''}
              source={tieneImagen ? { uri: `${perfilDatos.imgPerfil}?t=${forceUpdate}` } : null}
              containerStyle={{ backgroundColor: tieneImagen ? 'transparent' : '#3d4db7' }}
            />
          ) : (
            <ActivityIndicator size="large" color="#0000ff" />
          )}
          <Text>
            {perfilDatos ? `${perfilDatos.nombre} ${perfilDatos.apellido}` : 'Cargando...'}
          </Text>
        </View>
        <Button size="lg" onPress={pickImage}>
          Seleccionar una Imagen
        </Button>
      </Card>
    </View>
  );
};

export default FotoPerfil;
