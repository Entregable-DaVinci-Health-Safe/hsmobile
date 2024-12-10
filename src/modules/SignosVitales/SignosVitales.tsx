import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Animated, Easing, RefreshControl } from 'react-native';
import { Button, Card, Dialog } from '@rneui/themed';
import { SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import AxiosHealth from "../../Interceptor/AxiosHealth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoItems from '../../components/NoItems';
import AlertCustom from '../../components/AlertCustom';
import InputComponent from '../../components/inputs/InputComponent';
import { Formik } from 'formik';
import * as yup from "yup";
import ButtonHealth from '../../components/ButtonHealth';
import { useFocusEffect } from '@react-navigation/native';

interface SignoVital {
  id: number;
  tipoSignoVital: string;
  minimo: number;
  maximo: number;
  segundoMinimo?: number;
  segundoMaximo?: number;
}

const SignosVitales = ({route, navigation }) => {
  const [signosVitalesCustoms, setSignosVitalesCustoms] = useState<SignoVital[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogAdd, setDialogAdd] = useState({ visible: false, id: null });
  const [error, setError] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const animationHeights = useRef({});
  const iconRotations = useRef({});
  const dropdownItems = ['Historial', 'Agregar', 'Editar', 'Eliminar'];
  const [alertas, setAlertas] = useState({
    alertaVisible: { alertaBoolean: false, mensaje: '' },
  });
  const [dialogEliminar, setDialogEliminar] = useState({ visible: false, id: null, tipoSignoVital: '' });


  
  const fetchData = async () => {
    try {
      const idHc = await AsyncStorage.getItem("idHc");
      if (!idHc) {
        throw new Error("ID de historia clínica no disponible");
      }
  
      const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/signosVitalesCustoms`);

      const signosVitalesCustomsArray: SignoVital[] = response.data;
      setSignosVitalesCustoms(signosVitalesCustomsArray);
    } catch (error) {
      setError(error);
      console.error("Error fetching signos vitales:", error);
    }
  };

  useLayoutEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );
  
  useEffect(() => {
    if (route.params?.EditadoOAgregado) {
      fetchData();
      navigation.setParams({ EditadoOAgregado: false });
    }
  }, [route.params?.EditadoOAgregado]);

  const initializeAnimation = (itemId: number) => {
    if (!animationHeights.current[itemId]) {
      animationHeights.current[itemId] = new Animated.Value(0);
    }
    if (!iconRotations.current[itemId]) {
      iconRotations.current[itemId] = new Animated.Value(0);
    }
  };

  const handleToggleDropdown = (itemId: number) => {
    const itemHeight = 44;
    const totalHeight = itemHeight * dropdownItems.length;
    initializeAnimation(itemId);

    if (expandedItemId === itemId) {
      Animated.timing(animationHeights.current[itemId], {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      Animated.timing(iconRotations.current[itemId], {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => setExpandedItemId(null));
    } else {
      if (expandedItemId !== null) {
        Animated.timing(animationHeights.current[expandedItemId], {
          toValue: 0,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start(() => {
          setExpandedItemId(itemId);
          Animated.timing(animationHeights.current[itemId], {
            toValue: totalHeight,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start();
        });

        Animated.timing(iconRotations.current[expandedItemId], {
          toValue: 0,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start();
      } else {
        setExpandedItemId(itemId);
        Animated.timing(animationHeights.current[itemId], {
          toValue: totalHeight,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start();

        Animated.timing(iconRotations.current[itemId], {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const eliminarSignoVital = async (id: number) => {
    try {
      await AxiosHealth.delete(`/signosVitalesCustoms/${id}`);
      setAlertas({
        alertaVisible: { alertaBoolean: true, mensaje: 'El signo vital se eliminó correctamente.' },
      });
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el signo vital:", error);
      setAlertas({
        alertaVisible: { alertaBoolean: true, mensaje: 'Error al eliminar el signo vital.' },
      });
    }
  };

const initialValues = { registro: '' };

const validationSchema = yup.object().shape({
  registro: yup.string()
    .required('El valor de registro es requerido')
    .matches(/^\d+$/, 'Debe ser un número válido'), // Valida que sea un número
});

const handleSubmit = async (values) => {
  try {
    const idHc = await AsyncStorage.getItem("idHc");
    const id = dialogAdd.id; 
    if (!idHc) {
      throw new Error("ID de historia clínica no disponible");
    }

    await AxiosHealth.post(`/signosVitalesPacientes`, {
      comentario: values.registro.toString(),
      historiaMedicaId: idHc.toString(),
      segundoValor: null,
      signoVitalCustomId: id,
      valor: values.registro.toString(),
    });

    setAlertas({
      alertaVisible: { alertaBoolean: true, mensaje: 'Se registró correctamente.' },
    });
    fetchData();
    closeDialog();
  } catch (error) {
    console.error("Error fetching signos vitales:", error);
    setAlertas({
      alertaVisible: { alertaBoolean: true, mensaje: 'Error al registrar el signo vital.' },
    });
  }
};

const openDialog = (id) => {
  setDialogAdd({ visible: true, id });
};

const closeDialog = () => {
  setDialogAdd({ visible: false, id: null });
};

  const renderSignoVitalItem = ({ item }: { item: SignoVital }) => {
    const isExpanded = expandedItemId === item.id;
    initializeAnimation(item.id);

    const rotateInterpolate = iconRotations.current[item.id].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <Card containerStyle={styles.cardBody}>
        <Card.Title>{item.tipoSignoVital}</Card.Title>
        <Card.Divider />
        <View>
          <Text>Valor mínimo: {item.minimo}</Text>
          <Text>Valor máximo: {item.maximo}</Text>

          <View style={styles.actionsContainer}>
            <Button
              icon={
                <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                  <SimpleLineIcons name="arrow-down" size={20} color="white" />
                </Animated.View>
              }
              title={isExpanded ? "Ocultar Acciones" : "Ver Acciones"}
              onPress={() => handleToggleDropdown(item.id)}
              buttonStyle={styles.actionsButton}
              containerStyle={styles.fullWidthButton}
            />
          </View>

          {isExpanded && (
            <Animated.View style={[styles.dropdown, { height: animationHeights.current[item.id] }]}>
              {dropdownItems.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    switch (option) {
                      case "Historial":
                        navigation.navigate("SignosVitalesVer", { SignosVitalesHistorial: item.signosVitalesPaciente });
                        break;
                      case "Agregar":
                        openDialog(item.id)
                        break;
                      case "Editar":
                        navigation.navigate("SignosVitalesAgregar", { modoEdicion: true, signoVital: item });
                        break;
                        case "Eliminar":
                          setDialogEliminar({ visible: true, id: item.id, tipoSignoVital: item.tipoSignoVital });
                          break;
                      default:
                        Alert.alert("Alerta", `No hay función definida para la opción: ${option}`);
                    }
                  }}
                  
                >
                  <Text style={styles.dropdownText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>
        {alertas.alertaVisible.alertaBoolean && (
  <AlertCustom
    visible={alertas.alertaVisible.alertaBoolean}
    title=""
    message={alertas.alertaVisible.mensaje}
    buttons={[
      {
        text: "Aceptar",
        onPress: () => setAlertas({ alertaVisible: { alertaBoolean: false, mensaje: '' } }),
        style: "default",
      },
    ]}
  />
)}
{dialogEliminar.visible && (
  <AlertCustom
    visible={dialogEliminar.visible}
    title="Eliminar"
    message={`¿Está seguro que desea eliminar a ${dialogEliminar.tipoSignoVital}?`}
    buttons={[
      {
        text: "Cancelar",
        onPress: () => setDialogEliminar({ visible: false, id: null, tipoSignoVital: '' }),
        style: "cancel",
      },
      {
        text: "Aceptar",
        onPress: async () => {
          await eliminarSignoVital(dialogEliminar.id);
          setDialogEliminar({ visible: false, id: null, tipoSignoVital: '' });
        },
        style: "destructive",
      },
    ]}
  />
)}
      </Card>
    );
  };

  return (
    <>
    <View style={styles.container}>
      {error ? (
        <Text>Error al cargar los signos vitales.</Text>
      ) : signosVitalesCustoms.length === 0 ? (
        <NoItems item="signos vitales" />
      ) : (
        <FlatList
          data={signosVitalesCustoms}
          renderItem={renderSignoVitalItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.flatListContent} // Para asegurar el desplazamiento
        />
      )}
    </View>
          <View style={styles.buttonsContainer}>
          <ButtonHealth
    iconName="add-sharp"
    iconLibrary="Ionicons"
    onPress={() => navigation.navigate('SignosVitalesAgregar')}
        style={styles.button}
  />
  <ButtonHealth
    title="Volver"
    onPress={() => navigation.goBack()}
        style={styles.button}
  />
        </View>

        <Dialog isVisible={dialogAdd.visible} >
        <View>

        <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <InputComponent
              placeholder="Valor de Registro"
              value={values.registro}
              onChangeText={handleChange('registro')}
              onBlur={handleBlur('registro')}
              keyboardType="numeric"
              errorMessage={errors.registro && touched.registro ? errors.registro : ''}
            />
             <Dialog.Actions>
             <ButtonHealth
    title="Enviar"
    onPress={handleSubmit}
    size="medium"
  />
  <ButtonHealth
    title="Cancelar"
    onPress={() => closeDialog()}
    size="medium"
    style={{ backgroundColor: 'transparent', color: 'red' }}
  />
          </Dialog.Actions>
          </View>
        )}
      </Formik>
          
         
        </View>
      </Dialog>
        </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center", // Centra horizontalmente
    justifyContent: "center", // Centra verticalmente
  },
  cardBody: {
    width: '100%', // Haz que la tarjeta ocupe todo el ancho posible
    maxWidth: 450, // Opcional: establece un ancho máximo
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    alignSelf: "center", // Centra la tarjeta en el contenedor
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonsContainer: {
    height: "15%", // Altura fija para el contenedor de botones
    justifyContent: 'space-around',
    marginTop: -90,
    backgroundColor: '#F0F0F0',
  },
  button: {
    marginBottom: 10,
  },
  actionsButton: {
    backgroundColor: '#4F8EF7',
  },
  fullWidthButton: {
    width: '100%',
  },
  dropdown: {
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginTop: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 16,
  },
  flatListContent: {
    paddingBottom: 100,
  },
});

export default SignosVitales;
