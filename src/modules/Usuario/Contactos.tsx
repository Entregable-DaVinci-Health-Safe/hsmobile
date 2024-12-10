import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Dialog, Text } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import { Formik } from 'formik';
import { cargarPerfilDesdeAPI } from '../../assets/utils/utils';
import AxiosHealth from '../../Interceptor/AxiosHealth';
import { useLoading } from '../../components/LoadingContext';
import AlertCustom from '../../components/AlertCustom';
import { useTheme } from '@rneui/themed';
import InputComponent from '../../components/inputs/InputComponent';
import ButtonHealth from '../../components/ButtonHealth';

interface Contacto {
    telefono: string;
    mailAlternativo: string;
    id: number;
}

interface PerfilDatos {
    contactos: Contacto[];
}

const Contactos: React.FC = () => {
    const { theme } = useTheme();
    const [perfilDatos, setPerfilDatos] = useState<PerfilDatos | null>(null);
    const [alertaVisible, setAlertaVisible] = useState({ alertaBoolean: false, mensaje: "", idContacto: "" });
    const [modal, setModal] = useState(false);
    const { setLoading } = useLoading();

    const recargarDatosPerfil = async () => {
        setLoading(true);
        try {
            const datosPerfil = await cargarPerfilDesdeAPI();
            setPerfilDatos(datosPerfil);
        } catch (error) {
            console.error('Error al recargar datos del perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const eliminar = async (id: string) => {
        setLoading(true);
        try {
            await AxiosHealth.delete(`usuarios/eliminarContacto`, { data: { contactoId: id } });
            await recargarDatosPerfil();
            setAlertaVisible({ alertaBoolean: false, mensaje: "", idContacto: "" });
        } catch (error) {
            console.error('Error al eliminar contacto:', error);
        } finally {
            setLoading(false);
        }
    };

    const agregar = async (values: { telefono: string; email: string }) => {
        setLoading(true);
        try {
            await AxiosHealth.post(`usuarios/nuevoContacto`, {
                telefono: values.telefono,
                mailAlternativo: values.email,
            });
            await recargarDatosPerfil();
            setModal(false);
        } catch (error) {
            console.error('Error al agregar contacto:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            recargarDatosPerfil();
        }, [])
    );

    const renderContactCard = ({ item }: { item: Contacto }) => (
        <Card containerStyle={styles.contactCard}>
            <Text style={styles.contactText}>Teléfono: {item.telefono}</Text>
            <Text style={styles.contactText}>Email: {item.mailAlternativo}</Text>
            <ButtonHealth
                title="Eliminar contacto"
                onPress={() =>
                    setAlertaVisible({
                        alertaBoolean: true,
                        mensaje: "¿Quiere eliminar este contacto?",
                        idContacto: item.id.toString(),
                    })
                }
                style={styles.buttonDestructive}
            />
        </Card>
    );

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <Card>
                <View style={{ marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <ButtonHealth
                        title="Agregar contactos"
                        onPress={() => setModal(true)}
                        style={styles.buttonPrimary}
                    />
                </View>
            </Card>

            {perfilDatos?.contactos.length ? (
                <FlatList
                    data={perfilDatos.contactos}
                    renderItem={renderContactCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <View style={styles.noContactsContainer}>
                    <Text h4 style={styles.noContactsText}>No hay contactos disponibles</Text>
                </View>
            )}

            <AlertCustom
                visible={alertaVisible.alertaBoolean}
                onClose={() => setAlertaVisible({ alertaBoolean: false, mensaje: "", idContacto: "" })}
                title="¡Espera!"
                message={alertaVisible.mensaje}
                buttons={[
                    {
                        text: "Cancelar",
                        onPress: () => setAlertaVisible({ alertaBoolean: false, mensaje: "", idContacto: "" }),
                        style: "cancel",
                    },
                    {
                        text: "Aceptar",
                        onPress: () => eliminar(alertaVisible.idContacto),
                        style: "destructive",
                    },
                ]}
            />

            <Dialog isVisible={modal}>
                <Dialog.Title title="Agregar Contacto" />
                <Formik
                    initialValues={{ telefono: '', email: '' }}
                    validate={(values) => {
                        const errors: any = {};
                        if (!values.telefono && !values.email) {
                            errors.general = "Debe ingresar al menos un número de teléfono o email.";
                        }
                        return errors;
                    }}
                    onSubmit={(values) => agregar(values)}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <>
                            {errors.general && touched.telefono && touched.email && (
                                <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
                                    {errors.general}
                                </Text>
                            )}
                            <InputComponent
                                placeholder="Teléfono"
                                value={values.telefono}
                                onChangeText={handleChange('telefono')}
                                onBlur={handleBlur('telefono')}
                                errorMessage={touched.telefono && errors.telefono ? errors.telefono : ''}
                            />
                            <InputComponent
                                placeholder="Email"
                                value={values.email}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                errorMessage={touched.email && errors.email ? errors.email : ''}
                            />
                            <View style={styles.buttonContainer}>
                                <ButtonHealth
                                    title="Agregar"
                                    onPress={handleSubmit as any}
                                    style={styles.buttonPrimary}
                                />
                                <ButtonHealth
                                    title="Cancelar"
                                    onPress={() => setModal(false)}
                                    style={styles.buttonCancel}
                                />
                            </View>
                        </>
                    )}
                </Formik>
            </Dialog>
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingBottom: 20,
    },
    noContactsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noContactsText: {
        color: "#888",
        textAlign: "center",
        marginVertical: 20,
    },
    contactCard: {
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    contactText: {
        fontSize: 16,
        marginVertical: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 20,
    },
    buttonPrimary: {
        backgroundColor: "#5BACFF",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    buttonCancel: {
        backgroundColor: "#a0a0a0",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    buttonDestructive: {
        backgroundColor: "#d9534f",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
});

export default Contactos;
