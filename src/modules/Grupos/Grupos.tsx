import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Button, Icon, Card, Input, Dialog, Divider } from "@rneui/themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Formik } from "formik";
import * as Yup from "yup";
import AlertCustom from "../../components/AlertCustom";
import AxiosHealth from "../../Interceptor/AxiosHealth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoading } from "../../components/LoadingContext";
import { globalStyles } from "../../assets/themed/globalStyle";

import SvgFamilyGroup from "../../assets/groupfamily.svg";
import ButtonHealth from "../../components/ButtonHealth";
const Grupos = ({ navigation }) => {
  const [dialogNG, setDialogNG] = useState(false);
  const [dialogEG, setDialogEG] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertUnirse, setShowAlertUnirse] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [codigoUnirse, setCodigoUnirse] = useState("");
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertEliminar, setShowAlertEliminar] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [grupos, setGrupos] = useState([]);

  const { setLoading } = useLoading();

  const [grupoName, setGrupoName] = useState("");
  const [currentGroupId, setCurrentGroupId] = useState(null);

  const handleUnirseGrupoConfirmacion = (values) => {
    setCodigoUnirse(values.codigoInvitacion);
    setShowAlertUnirse(true);
  };

  const handleUnirseGrupo = async () => {
    const perfilString = await AsyncStorage.getItem("PerfilUsuario");
    const perfil = JSON.parse(perfilString);
    
    setLoading(true);
    AxiosHealth.post(`/gruposFamiliares/sendNotificacion`, {
      codigo: codigoUnirse,
      usuarioMail: perfil.mail,
    }).then(() => {
      setLoading(false);
      setShowAlertUnirse(false);
    })
    .catch((error) => {
      setLoading(false);
    });
  };

  const handleNuevoGrupo = () => {
    setDialogNG(true);
  };

  const handleEditarGrupo = (grupo) => {
    setCurrentGroupId(grupo.id);
    setGrupoName(grupo.nombre);
    setDialogEG(true);
  };

  const handleDelete = (grupoId) => {
    setGrupoSeleccionado(grupoId);
    setShowAlertEliminar(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await AxiosHealth.delete(`/gruposFamiliares/${grupoSeleccionado}/eliminar`);
      Alert.alert('', 'Se eliminó correctamente el grupo.');
      setShowAlertEliminar(false);
       await fetchData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el grupo. Por favor, intenta nuevamente.');
    } finally {
      setShowAlertEliminar(false);
      setGrupoSeleccionado(null);
    }
  };

  const handleVerGrupo = (grupo) => {
    navigation.navigate('GrupoDetalles', { grupoId: grupo.id, grupoNombre: grupo.nombre, codigo: grupo.codigo });
  };

  const handleSubmitForm = (values, action) => {
    setGrupoName(values.nombreGP);
    action === 'create' ? setShowAlert(true) : handleConfirmEditar(values.nombreGP);
  };

  const handleConfirm = async () => {
    const idHc = await AsyncStorage.getItem("idHc");
    const idUser = await AsyncStorage.getItem("idUsuario");
    setShowAlert(false);
    AxiosHealth.post(`/gruposFamiliares`, {
      nombre: grupoName,
      historiaMedicaId: idHc,
      usuarioId: idUser
    })
      .then(response => {
        setDialogNG(false);
        setShowAlertSuccess(true);
        fetchData(); 
      })
      .catch(error => {
        if (error.response && error.response.data) {
          setErrorMessage(error.response.data);
          setShowErrorAlert(true);
        } else {
          console.error("Error:", error);
        }
      });
  };
  
  
  const handleConfirmEditar = async (nombre) => {
    AxiosHealth.put(`/gruposFamiliares/${currentGroupId}`, {
      nombre: nombre
    }).then(response => {
      setDialogEG(false);
      setShowAlertSuccess(true);
      fetchData(); 
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const idHc = await AsyncStorage.getItem('idHc');
      const response = await AxiosHealth.get(`/historiasMedicas/${idHc}/gruposFamiliares`);

      if (Array.isArray(response.data)) {
        setGrupos(response.data);
      } else {
        console.error('La respuesta de la API no es un array:', response.data);
      }
      setLoading(false);
    } catch (error) {
      setGrupos([]);
      setLoading(false);
      console.error('Error al obtener datos de la API', error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
    <ScrollView style={styles.container}>
      <Dialog isVisible={dialogNG} onBackdropPress={() => setDialogNG(false)}>
        <Dialog.Title title="Nuevo Grupo" />
        <Text>
          Por favor ingrese el nombre que desea asignarle al nuevo grupo. El
          mismo podrá ser editado en el futuro si así lo desea.
        </Text>
        <Divider style={{ width: "90%", margin: 10 }} width={1} orientation="horizontal" />
        <Formik
          initialValues={{ nombreGP: "" }}
          validationSchema={Yup.object({
            nombreGP: Yup.string()
              .required("El nombre es obligatorio.")
              .min(4, "El nombre debe tener al menos 4 caracteres.")
              .max(16, "El nombre no debe exceder los 16 caracteres.")
              .matches(/^[a-zA-Z\s]+$/, "El nombre solo puede contener letras y espacios."),
          })}
          onSubmit={(values) => handleSubmitForm(values, 'create')}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
            <>
              <Input
                inputContainerStyle={globalStyles.inputContainerStyle}
                inputStyle={globalStyles.inputStyle}
                placeholder="Nombre de nuevo grupo *"
                value={values.nombreGP}
                onChangeText={handleChange("nombreGP")}
                onBlur={handleBlur("nombreGP")}
                errorMessage={errors.nombreGP as any}
              />
              <View style={globalStyles.agruparBotones}>
              <ButtonHealth
                  onPress={handleSubmit as any}
                  title="CREAR"
                  style={{ marginRight: 10 }}
                />
                <ButtonHealth
                  onPress={() => setDialogNG(false)}
                  title="CANCELAR"
                  style={{ marginRight: 10 }}
                />
              </View>
            </>
          )}
        </Formik>
      </Dialog>
      <Dialog isVisible={dialogEG} onBackdropPress={() => setDialogEG(false)}>
        <Dialog.Title title="Edicion de Grupo " />
        <Text>
          El mismo podrá ser editado nuevamente en el futuro si así lo desea.
        </Text>
        <Divider style={{ width: "90%", margin: 10 }} width={1} orientation="horizontal" />
        <Formik
          initialValues={{ nombreGP: grupoName }}
          validationSchema={Yup.object({
            nombreGP: Yup.string()
              .required("El nombre es obligatorio.")
              .min(4, "El nombre debe tener al menos 4 caracteres.")
              .max(16, "El nombre no debe exceder los 16 caracteres.")
              .matches(/^[a-zA-Z\s]+$/, "El nombre solo puede contener letras y espacios."),
          })}
          onSubmit={(values) => handleSubmitForm(values, 'edit')}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
            <>
              <Input
                inputContainerStyle={globalStyles.inputContainerStyle}
                inputStyle={globalStyles.inputStyle}
                placeholder="Nombre de nuevo grupo *"
                value={values.nombreGP}
                onChangeText={handleChange("nombreGP")}
                onBlur={handleBlur("nombreGP")}
                errorMessage={errors.nombreGP as any}
              />
              <View style={globalStyles.agruparBotones}>
              <ButtonHealth
                onPress={handleSubmit as any}
                title="GUARDAR"
                style={{ marginRight: 10 }}
              />
              <ButtonHealth
                onPress={() => setDialogEG(false)}
                title="CANCELAR"
              />
              </View>
            </>
          )}
        </Formik>
      </Dialog>
      <View style={globalStyles.card}>
        <Text style={globalStyles.header}>Mis Grupos</Text>
        <Text style={globalStyles.description}>
          Aquí se listan los grupos a los que perteneces como Administrador y a
          los que te hayas unido como Invitado.
        </Text>
        {grupos.map((grupo) => (
          <Card key={grupo.id} containerStyle={globalStyles.groupCard}>
            <View style={globalStyles.groupContainer}>
              <Text style={globalStyles.groupName}>{grupo.nombre}</Text>
              <View style={globalStyles.separadorBotones}>
                <TouchableOpacity onPress={() => handleEditarGrupo(grupo)}>
                  <Icon name="edit" type="material" />
                </TouchableOpacity>
                <Divider width={1} />
                <TouchableOpacity onPress={() => handleVerGrupo(grupo)}>
                  <Icon name="visibility" type="material" />
                </TouchableOpacity>
                <Divider width={1} />
                <TouchableOpacity key={grupo.id} onPress={() => handleDelete(grupo.id)}>
                  <Icon name="delete" type="material" color={"red"} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
<ButtonHealth
  onPress={handleNuevoGrupo}
  title="NUEVO GRUPO"
  style={{ width: "100%", marginTop: 20 }}
/>
      </View>
      <View style={globalStyles.card}>
        <Text style={globalStyles.header}>Unirse a un Grupo</Text>
        <Text style={globalStyles.description}>
          Para ingresar a un Grupo, debe solicitar un código de invitación, el
          mismo lo recepcionará mediante correo electrónico.
        </Text>
        <Formik
          initialValues={{ codigoInvitacion: "" }}
          validationSchema={Yup.object({
            codigoInvitacion: Yup.string().required(
              "El código de invitación es requerido"
            ),
          })}
          onSubmit={handleUnirseGrupoConfirmacion}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
            <>
              <Input
                inputContainerStyle={globalStyles.inputContainerStyle}
                inputStyle={globalStyles.inputStyle}
                placeholder="Ingresar código de invitación *"
                value={values.codigoInvitacion}
                onChangeText={handleChange("codigoInvitacion")}
                onBlur={handleBlur("codigoInvitacion")}
                errorMessage={errors.codigoInvitacion as any}
              />
              <Text style={globalStyles.helperText}>
                Debe ingresar un código válido recibido por correo.
              </Text>
              <ButtonHealth
                onPress={handleSubmit as any}
                title="UNIRSE"
                style={{ width: "100%" }}
              />
            </>
          )}
        </Formik>
      </View>

      <View style={styles.centeredSvg}>
      <SvgFamilyGroup width={300} height={300}/>
      </View>

      <AlertCustom
        visible={showAlertUnirse}
        onClose={() => setShowAlertUnirse(false)}
        title="Confirmación"
        message="¿Está seguro que desea unirse al grupo?"
        buttons={[
          { text: 'Cancelar', onPress: () => setShowAlertUnirse(false), style: 'cancel' },
          { text: 'Confirmar', onPress: () => handleUnirseGrupo() },
        ]}
      />

      <AlertCustom
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        title="Confirmación"
        message="¿Está seguro que desea crear el grupo?"
        buttons={[
          { text: 'Cancelar', onPress: () => setShowAlert(false), style: 'cancel' },
          { text: 'Crear', onPress: () => handleConfirm() },
        ]}
      />

      <AlertCustom
        visible={showAlertEliminar}
        onClose={() => setShowAlertEliminar(false)}
        title="Confirmación"
        message="¿Está seguro que desea eliminar el grupo?"
        buttons={[
          { text: 'Cancelar', onPress: () => setShowAlertEliminar(false), style: 'cancel' },
          { text: 'Eliminar', onPress: () => handleDeleteConfirm() },
        ]}
      />

      <AlertCustom
        visible={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        title="Error"
        message={errorMessage}
        buttons={[
          { text: 'OK', onPress: () => setShowErrorAlert(false) },
        ]}
      />

    <AlertCustom
        visible={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        title="Error"
        message={errorMessage}
        buttons={[
          { text: 'OK', onPress: () => setShowErrorAlert(false) },
        ]}
      />
      
    </ScrollView>
    <View style={styles.buttonsContainer}>

    <ButtonHealth
  onPress={() => navigation.goBack()}
  title="Volver"
/>
  </View>
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 10,
    justifyContent: 'space-around',
  },
  button: {
    marginBottom: 10,
  },
  centeredSvg: {
  alignItems: 'center'
  }
});

export default Grupos;
