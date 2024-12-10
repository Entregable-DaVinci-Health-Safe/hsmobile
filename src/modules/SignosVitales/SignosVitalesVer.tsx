// src/modules/SignosVitales/SignosVitalesVer.tsx

import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import { Card, Text } from "@rneui/themed";
import { SimpleLineIcons } from '@expo/vector-icons';
import NoItems from "../../components/NoItems";
import ButtonHealth from "../../components/ButtonHealth";
import AlertCustom from "../../components/AlertCustom"; // Asegúrate de que la ruta sea correcta
import * as yup from "yup";
import { Formik } from "formik";
import AxiosHealth from "../../Interceptor/AxiosHealth";

// Definición de tipos para SignoVital y Props
interface SignoVital {
    id: number;
    fechaIngresado: string;
    valor: string;
    segundoValor?: string | null;
    resultado: string;
    segundoResultado?: string | null;
    comentario: string;
    minimo: number; // Añadido
    maximo: number; // Añadido
}

interface Props {
    route: {
        params: {
            SignosVitalesHistorial: SignoVital[];
        };
    };
    navigation: any;
}

const SignosVitalesVer: React.FC<Props> = ({ route, navigation }) => {
    const { SignosVitalesHistorial } = route.params;
    
    // Estado local para manejar la lista de signos vitales
    const [signosVitalesHistorial, setSignosVitalesHistorial] = useState<SignoVital[]>(SignosVitalesHistorial || []);
    
    // Estados para manejar los diálogos y alertas
    const [selectedEvaluation, setSelectedEvaluation] = useState<SignoVital | null>(null);
    const [showOptionsAlert, setShowOptionsAlert] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    
    // Estado para manejar las alertas de éxito y error
    const [alertas, setAlertas] = useState<{
        alertaVisible: { alertaBoolean: boolean; mensaje: string };
        alertaVisibleError: { alertaBoolean: boolean; mensaje: string };
    }>({
        alertaVisible: { alertaBoolean: false, mensaje: "" },
        alertaVisibleError: { alertaBoolean: false, mensaje: "" },
    });

    // Función para cerrar todas las alertas
    const handleCloseAlerta = () => {
        setAlertas((prev) => ({
            ...prev,
            alertaVisible: { alertaBoolean: false, mensaje: "" },
            alertaVisibleError: { alertaBoolean: false, mensaje: "" },
        }));
    };

    // Función para formatear la fecha
    const formatFecha = (fechaIngresado: string): string => {
        const date = new Date(fechaIngresado);
        return date.toLocaleDateString(); // Formato más legible
    };

    // Función para obtener estilos basados en el resultado
    const getEstiloResultado = (resultado: string, segundoResultado?: string | null) => {
        const isNormal = resultado === 'Normal' && (!segundoResultado || segundoResultado === 'Normal');
        return {
            fontWeight: isNormal ? "normal" : "bold",
            color: isNormal ? "green" : "red",
        };
    };

    // Función para eliminar un signo vital
    const borrarSignoVital = async () => {
        if (!selectedEvaluation) return;

        setLoading(true);
        try {
            await AxiosHealth.delete(`/signosVitalesPacientes/${selectedEvaluation.id}`);
            // Actualizar la lista localmente
            setSignosVitalesHistorial(prev => prev.filter(item => item.id !== selectedEvaluation.id));
            setAlertas({
                ...alertas,
                alertaVisible: { alertaBoolean: true, mensaje: "Signo vital eliminado correctamente." },
            });
        } catch (error: any) {
            console.error("Error eliminando signo vital:", error);
            setAlertas({
                ...alertas,
                alertaVisibleError: { alertaBoolean: true, mensaje: `Error al eliminar signo vital: ${error.message}` },
            });
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setSelectedEvaluation(null);
        }
    };

    // Función para actualizar un signo vital
    const actualizarSignoVital = async (values) => {
        if (!selectedEvaluation) return;

        setLoading(true);
        try {
            // Convertir el valor a número para la comparación
            const nuevoValor = parseFloat(values.editable);
            const minimo = selectedEvaluation.minimo;
            const maximo = selectedEvaluation.maximo;

            // Recalcular el resultado
            let nuevoResultado = "Alto"; // Valor predeterminado

            if (nuevoValor < minimo) {
                nuevoResultado = "Bajo";
            } else if (nuevoValor >= minimo && nuevoValor <= maximo) {
                nuevoResultado = "Normal";
            }

            // Actualizar la evaluación con el nuevo valor y resultado
            await AxiosHealth.put(`/signosVitalesPacientes/${selectedEvaluation.id}`, {
                comentario: values.editable.toString(),
                segundoValor: null, // O según corresponda
                valor: values.editable.toString(),
            });

            // Actualizar el estado local para reflejar el cambio en memoria
            setSignosVitalesHistorial((prev) =>
                prev.map((item) =>
                    item.id === selectedEvaluation.id
                        ? { ...item, valor: values.editable, resultado: nuevoResultado }
                        : item
                )
            );

            setAlertas({
                ...alertas,
                alertaVisible: { alertaBoolean: true, mensaje: "Signo vital actualizado correctamente." },
            });
        } catch (error: any) {
            console.error("Error actualizando signo vital:", error);
            setAlertas({
                ...alertas,
                alertaVisibleError: { alertaBoolean: true, mensaje: `Error al actualizar signo vital: ${error.message}` },
            });
        } finally {
            setLoading(false);
            setShowEditDialog(false);
            setSelectedEvaluation(null);
        }
    };
    

    // Renderiza cada evaluación en una tarjeta con estilos detallados
    const renderEvaluationCard = ({ item }: { item: SignoVital }) => (
        <Card containerStyle={styles.table}>
            {/* Fecha de Evaluación */}
            <View style={styles.row}>
                <View style={styles.cell}>
                    <Text style={styles.headerText}>Fecha de evaluación</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.text}>{formatFecha(item.fechaIngresado)}</Text>
                </View>
            </View>

            {/* Valor Registrado */}
            <View style={styles.row}>
                <View style={styles.cell}>
                    <Text style={styles.headerText}>Valor registrado</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.text}>
                        {item.valor}
                        {item.segundoValor ? ` - ${item.segundoValor}` : ''}
                    </Text>
                </View>
            </View>

            {/* Resultado */}
            <View style={styles.row}>
                <View style={styles.cell}>
                    <Text style={styles.headerText}>Resultado</Text>
                </View>
                <View style={[styles.cell, getEstiloResultado(item.resultado, item.segundoResultado)]}>
                    <Text style={styles.resultText}>
                        {item.resultado} {item.segundoResultado ? `| ${item.segundoResultado}` : ''}
                    </Text>
                </View>
            </View>

            {/* Comentario */}
         <View style={styles.row}>
                <View style={styles.cell}>
                    <Text style={styles.headerText}>Min - Max</Text>
                </View>
                <View style={styles.cell}>
                    <Text style={styles.text}>{item.minimo} - {item.maximo}</Text>
                </View>
            </View>


            {/* Acciones */}
            <View style={styles.row}>
                <View style={styles.cell}>
                    <Text style={styles.headerText}>Acciones</Text>
                </View>
                <View style={styles.cell}>
                    <TouchableOpacity onPress={() => {
                        setSelectedEvaluation(item);
                        setShowOptionsAlert(true);
                    }}>
                        <SimpleLineIcons name="options" size={24} color="#4483BC" />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    // Esquema de validación para editar
    const editValidationSchema = yup.object().shape({
        editable: yup
            .number()
            .typeError("Debe ser un número")
            .required("El valor es requerido"),
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Historial de Evaluaciones</Text>
            {signosVitalesHistorial && signosVitalesHistorial.length > 0 ? (
                <FlatList
                    data={signosVitalesHistorial}
                    renderItem={renderEvaluationCard}
                    keyExtractor={(item) => item.id.toString()}
                />
            ) : (
                <NoItems item={'un historial de evaluación'} />
            )}
            <ButtonHealth title="Volver" onPress={() => navigation.goBack()} />

            {/* AlertCustom para Opciones (Editar/Eliminar) */}
            {showOptionsAlert && selectedEvaluation && (
                <AlertCustom
                    visible={showOptionsAlert}
                    title="Opciones"
                    message={`¿Qué deseas hacer con la evaluación de ${formatFecha(selectedEvaluation.fechaIngresado)}?`}
                    buttons={[
                        {
                            text: "Editar",
                            onPress: () => {
                                setShowOptionsAlert(false);
                                setShowEditDialog(true);
                            },
                            style: "default"
                        },
                        {
                            text: "Eliminar",
                            onPress: () => {
                                setShowOptionsAlert(false);
                                setShowDeleteConfirm(true);
                            },
                            style: "destructive",
                        },
                        {
                            text: "Cancelar",
                            onPress: () => {
                                setShowOptionsAlert(false);
                                setSelectedEvaluation(null);
                            },
                            style: "cancel",
                        },
                    ]}
                />
            )}

            {/* AlertCustom para Confirmar Eliminación */}
            {showDeleteConfirm && selectedEvaluation && (
                <AlertCustom
                    visible={showDeleteConfirm}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar la evaluación de ${formatFecha(selectedEvaluation.fechaIngresado)}?`}
                    buttons={[
                        {
                            text: "Sí, Eliminar",
                            onPress: borrarSignoVital,
                            style: "destructive",
                        },
                        {
                            text: "Cancelar",
                            onPress: () => {
                                setShowDeleteConfirm(false);
                                setSelectedEvaluation(null);
                            },
                            style: "cancel",
                        },
                    ]} />
            )}

            {/* Modal para Editar Signo Vital */}
            {showEditDialog && selectedEvaluation && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showEditDialog}
                    onRequestClose={() => {
                        setShowEditDialog(false);
                        setSelectedEvaluation(null);
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Editar Evaluación</Text>
                            <Formik
                                initialValues={{
                                    editable: selectedEvaluation.valor, // Prellenar con el valor actual
                                }}
                                validationSchema={editValidationSchema}
                                onSubmit={(values) => {
                                    actualizarSignoVital(values);
                                }}
                            >
                                {({
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    values,
                                    errors,
                                    touched,
                                }) => (
                                    <View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ingrese un valor"
                                            keyboardType="numeric"
                                            onChangeText={handleChange("editable")}
                                            onBlur={handleBlur("editable")}
                                            value={values.editable}
                                        />
                                        {errors.editable && touched.editable && (
                                            <Text style={styles.errorText}>{errors.editable}</Text>
                                        )}

                                        <View style={styles.modalButtonContainer}>
                                            <ButtonHealth title="Guardar Cambios" onPress={handleSubmit} />
                                            <ButtonHealth title="Cancelar" onPress={() => {
                                                setShowEditDialog(false);
                                                setSelectedEvaluation(null);
                                            }} />
                                        </View>
                                    </View>
                                )}
                            </Formik>
                        </View>
                    </View>
                </Modal>
            )}

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
                            onPress: handleCloseAlerta,
                        },
                    ]}
                />
            )}

            {/* Indicador de Carga */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}
        </View>
    );
    }
        const styles = StyleSheet.create({
            container: {
                flex: 1,
                padding: 10,
                backgroundColor: "#f5f5f5",
            },
            title: {
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 10,
                textAlign: "center",
            },
            table: {
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                overflow: "hidden",
                marginVertical: 5,
                padding: 10,
            },
            row: {
                flexDirection: "row",
                borderBottomWidth: 1,
                borderColor: "#ddd",
                paddingVertical: 8,
            },
            cell: {
                flex: 1,
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
            },
            headerText: {
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 16,
            },
            text: {
                textAlign: "center",
                fontSize: 14,
            },
            resultText: {
                fontWeight: "bold",
                textAlign: "center",
            },
            actionText: {
                fontSize: 20,
                color: "#007bff",
            },
            // Estilos para el Modal de Edición
            modalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            },
            modalContainer: {
                width: '90%',
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 20,
            },
            modalTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 20,
                textAlign: 'center',
            },
            input: {
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
            },
            errorText: {
                color: 'red',
                marginBottom: 10,
                textAlign: 'center',
            },
            modalButtonContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
            },
            // Estilos para la carga
            loadingOverlay: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
            },
        });

export default SignosVitalesVer;
