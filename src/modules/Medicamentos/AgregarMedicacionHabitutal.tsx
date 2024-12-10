import React, { useEffect } from "react";
import { View, ScrollView, LayoutAnimation, Platform, UIManager, StyleSheet } from "react-native";
import { Formik } from "formik";
import InputComponent from "../../components/inputs/InputComponent";
import DropdownComponent from "../../components/inputs/DropdownComponent";
import { globalStyles } from "../../assets/themed/globalStyle";
import { useMedicacionHabitualForm } from "./hook/UseMedicacionHabitualForm";
import ButtonHealth from "../../components/ButtonHealth";
import AlertCustom from "../../components/AlertCustom"; 

if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AgregarMedicacionHabitutal = ({ route, navigation }) => {
    const { params } = route;

    const {
        drogasPrincipales,
        productos,
        validationSchema,
        handleSubmitMedicamento,
        handleSearchDrogaPrincipal,
        handleSelectDrogaPrincipal,
        alertas,
        setAlertas,
    } = useMedicacionHabitualForm(params?.medicacionIndex, params?.modoEdicion);

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, []);

    
    const handleCloseAlerta = () => {
        navigation.navigate('MedicamentosList', { 
            EditadoOAgregado: true,
        });
        setAlertas((prev) => ({
            ...prev,
            alertaVisible: { alertaBoolean: false, mensaje: '' },
            alertaVisibleError: { alertaBoolean: false, mensaje: '' },
        }));
    };

    return (
        <ScrollView contentContainerStyle={globalStyles.containerStyle}>
            <Formik
                initialValues={{
                    drogaPrincipal: params?.medicacionIndex?.drogaPrincipal || "",
                    generico: params?.medicacionIndex?.generico || "",
                    unidadMedida: "",
                    cantidad: "",
                    comentarios: params?.medicacionIndex?.comentarios || "",
                }}
                validationSchema={!params?.modoEdicion ? validationSchema : null}
                onSubmit={async (values) => {
                    await handleSubmitMedicamento(values);              
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <View style={[globalStyles.formContainerStyle, styles.switchContainer]}>
                        {!params?.modoEdicion && (
                            <>
                                <DropdownComponent
                                    data={drogasPrincipales.map(item => ({ label: item.nombre, value: item.id }))}
                                    selectedValue={
                                        drogasPrincipales
                                            .map(item => ({ label: item.nombre, value: item.id }))
                                            .find(opt => opt.value === values.drogaPrincipal) || { label: '', value: '' }
                                    }
                                    setSelectedValue={(item) => {
                                        setFieldValue("drogaPrincipal", item.value);
                                        handleSelectDrogaPrincipal(item.value);
                                    }}
                                    placeholder="Droga principal del medicamento"
                                    errorMessage={errors.drogaPrincipal && touched.drogaPrincipal ? String(errors.drogaPrincipal) : ""}
                                    onSearch={handleSearchDrogaPrincipal}
                                />

                                <DropdownComponent
                                    data={productos.map(item => ({ label: item.nombre, value: item.id }))}
                                    selectedValue={
                                        productos
                                            .map(item => ({ label: item.nombre, value: item.id }))
                                            .find(opt => opt.value === values.generico) || { label: '', value: '' }
                                    }
                                    setSelectedValue={(item) => setFieldValue("generico", item.value)}
                                    placeholder="Genérico"
                                    errorMessage={errors.generico && touched.generico ? String(errors.generico) : ""}
                                    disabled={productos.length === 0}
                                />

                            </>
                        )}

                        <InputComponent
                            placeholder="Comentarios"
                            value={values.comentarios}
                            onChangeText={handleChange("comentarios")}
                            onBlur={handleBlur("comentarios")}
                            errorMessage={errors.comentarios && touched.comentarios ? String(errors.comentarios) : ""}
                        />

                        <View style={styles.butonContainer}>
                            <ButtonHealth
                                title={params?.modoEdicion ? "Actualizar Medicación" : "Agregar Medicación"}
                                onPress={() => handleSubmit()}
                                size="medium"
                            />

                            <ButtonHealth
                                title="Volver"
                                onPress={() => navigation.goBack()}
                                size="medium"
                            />
                        </View>
                    </View>
                )}
            </Formik>

            {/* Mostrar las alertas en base a su estado */}
            {alertas.alertaVisible.alertaBoolean && (
                <AlertCustom
                    visible={alertas.alertaVisible.alertaBoolean}
                    title="Operación Exitosa"
                    message={alertas.alertaVisible.mensaje}
                    buttons={[
                        {
                            text: "OK",
                            onPress: handleCloseAlerta, 
                            style: "default",
                        },
                    ]}
                />
            )}

            {alertas.alertaVisibleError.alertaBoolean && (
                <AlertCustom
                    visible={alertas.alertaVisibleError.alertaBoolean}
                    title="Error"
                    message={alertas.alertaVisibleError.mensaje}
                    buttons={[
                        {
                            text: "OK",
                            onPress: () => {
                                setAlertas(prev => ({
                                    ...prev,
                                    alertaVisibleError: { alertaBoolean: false, mensaje: "" },
                                }));
                            },
                            style: "destructive",
                        },
                    ]}
                />
            )}

            {alertas.alertaEstaSeguro && (
                <AlertCustom
                    visible={alertas.alertaEstaSeguro}
                    title="Confirmación"
                    message="¿Está seguro?"
                    buttons={[
                        {
                            text: "Aceptar",
                            onPress: () => {
                                setAlertas(prev => ({
                                    ...prev,
                                    alertaEstaSeguro: false,
                                }));
                                
                                console.log("Confirmación aceptada.");
                            },
                            style: "default",
                        },
                        {
                            text: "Cancelar",
                            onPress: () => {
                                setAlertas(prev => ({
                                    ...prev,
                                    alertaEstaSeguro: false,
                                }));
                            },
                            style: "cancel",
                        },
                    ]}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    switchContainer: {
        marginBottom: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        backgroundColor: '#fff',
    },
    butonContainer:{
        gap: 10
    }
});

export default AgregarMedicacionHabitutal;
