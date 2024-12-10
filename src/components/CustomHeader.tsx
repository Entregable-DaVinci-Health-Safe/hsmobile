// src/components/CustomHeader.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Avatar, Icon, Skeleton } from '@rneui/themed';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { obtenerIniciales } from '../assets/utils/utils';
import eventBus from '../assets/utils/EventBust';
interface CustomHeaderProps {
    onCerrarSesion: (isLoggedIn: boolean) => void;
    estaLogueado: boolean;
}

interface DrawerProps extends CustomHeaderProps {
    state: any;
    navigation: any;
    descriptors: any;
}

interface AutorizacionComponente {
    activo: boolean;
    codigo: string;
    componentes: any[];
    descripcion: string;
    id: number;
}

interface PerfilDatos {
    activo: boolean;
    apellido: string;
    autorizacionesComponentes: AutorizacionComponente[];
    contactos: any[];
    direcciones: any[];
    fechaNacimiento: string;
    genero: string;
    id: number;
    imgPerfil: string | null;
    mail: string;
    nombre: string;
}

const CustomHeader: React.FC<DrawerProps> = React.memo((props) => {
    const [perfilDatos, setPerfilDatos] = useState<PerfilDatos | null>(null);
    const tieneImagen = perfilDatos && perfilDatos.imgPerfil;

    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    const cerrarSesion = async () => {
        try {
            await AsyncStorage.removeItem('PerfilUsuario');
            setPerfilDatos(null);
            props.onCerrarSesion(false);
        } catch (error) {
            console.error('Error al eliminar claves:', error);
        }
    };

    const cargarPerfil = async () => {
        try {
            const perfilUsuario = await AsyncStorage.getItem('PerfilUsuario');
            if (perfilUsuario) {
                const perfilObj = JSON.parse(perfilUsuario);
                setPerfilDatos(perfilObj);
            } else {
                console.warn('Perfil del usuario no encontrado en AsyncStorage.');
            }
        } catch (error) {
            console.error('Error al obtener el perfil del usuario:', error);
        }
    };

    useEffect(() => {
        if (props.estaLogueado) {
            cargarPerfil();
        }
    }, [props.estaLogueado]);

    useEffect(() => {
        // Suscribirse al evento 'perfilActualizado'
        const actualizarPerfil = () => {
            cargarPerfil();
        };

        eventBus.on('perfilActualizado', actualizarPerfil);

        // Limpiar la suscripción al desmontar el componente
        return () => {
            eventBus.off('perfilActualizado', actualizarPerfil);
        };
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <ImageBackground
                    source={require('../assets/menu-bg.png')}
                    style={{ padding: 20, marginTop: -5 }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 20,
                        }}
                    >
                        {perfilDatos ? (
                            <Avatar
                                size={64}
                                rounded
                                title={!tieneImagen ? obtenerIniciales(perfilDatos.nombre, perfilDatos.apellido) : ''}
                                source={tieneImagen ? { uri: `${perfilDatos.imgPerfil}?t=${Date.now()}` } : null}
                                containerStyle={{ backgroundColor: tieneImagen ? 'transparent' : '#3d4db7' }}
                            />
                        ) : (
                            <Skeleton width={64} height={64} animation="wave" />
                        )}
                        <Icon
                            name="settings"
                            type="material"
                            color="#fff"
                            onPress={() =>
                                navigation.navigate('Usuario', {
                                    screen: 'UsuarioConfig',
                                })
                            }
                        />
                    </View>
                    <Text style={{ color: '#fff', fontSize: 18, marginBottom: 5 }}>
                        {perfilDatos ? `${perfilDatos.nombre} ${perfilDatos.apellido}` : 'Cargando...'}
                    </Text>
                    <Text style={{ color: '#fff', marginRight: 5 }}>
                        {perfilDatos ? perfilDatos.mail : 'Cargando...'}
                    </Text>
                </ImageBackground>
                <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 10 }}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#ccc' }}>
                <TouchableOpacity onPress={() => { }} style={{ paddingVertical: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, marginLeft: 5 }}>
                            ¿Necesitas ayuda?
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={cerrarSesion} style={{ paddingVertical: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, marginLeft: 5 }}>
                            Cerrar sesión
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default CustomHeader;
