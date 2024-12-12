
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ColorValue,
  ActivityIndicator,
} from "react-native";
import { Button, Icon, Card, Divider, Dialog, Input } from "@rneui/themed";
import { Formik } from "formik";
import * as Yup from "yup";
import AxiosHealth from "../../Interceptor/AxiosHealth";
import { globalStyles } from "../../assets/themed/globalStyle";
import AlertCustom from "../../components/AlertCustom";
import { useLoading } from "../../components/LoadingContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GrupoDetalles = ({ route, navigation }) => {
  const { setLoading } = useLoading();
  const { grupoId, grupoNombre, codigo } = route.params;

  const [miembros, setMiembros] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [nombreGrupoActual, setNombreGrupoActual] = useState(grupoNombre);
  const [historiasMedicasResponse, setHistoriasMedicasResponse] = useState([]);

  const [isDialogVisible, setDialogVisible] = useState(false);
  const [isLeaveDialogVisible, setLeaveDialogVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertEliminar, setShowAlertEliminar] = useState(false);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [emailToInvite, setEmailToInvite] = useState("");
  const [isManageDialogVisible, setManageDialogVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [nombreGrupoEditar, setNombreGrupoEditar] = useState("");
  const [isEditGroupNameDialogVisible, setEditGroupNameDialogVisible] = useState(false);
  const [firstMemberEmail, setFirstMemberEmail] = useState("");

  
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  
  const [idHc, setIdHc] = useState(null);
  const [loggedUserMail, setLoggedUserMail] = useState(null);

  useEffect(() => {
    (async () => {
      const storedIdHc = await AsyncStorage.getItem("idHc");
      setIdHc(storedIdHc);
    })();
  }, []);

  useEffect(() => {
    if (idHc) {
      fetchGrupoDetalles();
    }
  }, [idHc]);

  const fetchGrupoDetalles = async () => {
    try {
      setLoading(true);
      const response = await AxiosHealth.get(`/gruposFamiliares/${grupoId}`);
      const data = response.data;

      if (data) {
        setMiembros(data.usuarios || []);
        setAdmins(data.admins || []);
        setSolicitudes(data.notificaciones || []);
        setNombreGrupoActual(data.nombre || grupoNombre);
        setHistoriasMedicasResponse(data.historiasMedicasResponse || []);

        if (data.usuarios && data.usuarios.length > 0) {
          setFirstMemberEmail(data.usuarios[0].mail);
        } else {
          setFirstMemberEmail(null); 
        }

        
        if (data.historiasMedicasResponse && idHc) {
          const historiaUsuario = data.historiasMedicasResponse.find(
            (historia) => historia.id.toString() === idHc.toString()
          );
          if (historiaUsuario && historiaUsuario.paciente && historiaUsuario.paciente.mail) {
            setLoggedUserMail(historiaUsuario.paciente.mail);
          }
        }
      } else {
        console.error("No se recibió información del grupo.");
        Alert.alert("Error", "No se recibió información del grupo.");
      }
    } catch (error) {
      console.error("Error fetching grupo details:", JSON.stringify(error.response?.data || error, null, 2));
      Alert.alert("Error", "No se pudieron cargar los detalles del grupo.");
    } finally {
      setLoading(false);
    }
  };

  const getHistoriaMedicaIdByEmail = (email) => {
    if (!historiasMedicasResponse || historiasMedicasResponse.length === 0) {
      console.warn("No hay historias médicas disponibles.");
      return null;
    }

    const historia = historiasMedicasResponse.find(
      (historia) => historia.paciente.mail.toLowerCase() === email.toLowerCase()
    );

    if (historia) {
      return historia.id;
    } else {
      console.warn(`No se encontró una historia médica para el email: ${email}`);
      return null;
    }
  };

  const handleInviteMember = (values) => {
    setEmailToInvite(values.email);
    setShowAlert(true);
  };

  const handleConfirm = () => {
    setLoading(true);
    AxiosHealth.post(`/gruposFamiliares/sendInvitacion`, {
      codigo,
      usuarioMail: emailToInvite,
    })
      .then((response) => {
        setLoading(false);
        setDialogVisible(false);
        setShowAlertSuccess(true);
        fetchGrupoDetalles();
      })
      .catch((error) => {
        setDialogVisible(false);
        setShowAlert(false);
        setLoading(false);
        console.error("Error al enviar datos a la API", error.response?.data?.message || error.message);
        Alert.alert(
          "Error",
          error.response?.data?.message || "No se pudo enviar la invitación. Por favor, intenta nuevamente."
        );
      });

    setShowAlert(false);
    setDialogVisible(false);
  };

  const handleConfirmEditGroupName = () => {
    setLoading(true);
    AxiosHealth.put(`/gruposFamiliares/${grupoId}`, {
      nombre: nombreGrupoEditar,
    })
      .then((response) => {
        setLoading(false);
        setEditGroupNameDialogVisible(false);
        fetchGrupoDetalles();
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error al editar nombre del grupo", error.response?.data?.message || error.message);
        Alert.alert(
          "Error",
          error.response?.data?.message || "No se pudo editar el nombre del grupo. Por favor, intenta nuevamente."
        );
      });
  };

  const toggleIconsVisibility = (id) => {
    setExpandedMemberId((prevId) => (prevId === id ? null : id));
  };

  const toggleRequestIconsVisibility = (id) => {
    setExpandedRequestId((prevId) => (prevId === id ? null : id));
  };

  const handleExpulsar = (miembro) => {
    setMiembroSeleccionado(miembro);
    setShowAlertEliminar(true);
  };

  const bajarIntegrante = async (id, email) => {
    try {
      setLoading(true);
      await AxiosHealth.put(`/gruposFamiliares/${grupoId}/removerUsuario`, {
        usuarioMail: email,
      });
      fetchGrupoDetalles();
      Alert.alert("Éxito", "El usuario ha sido removido del grupo.");
    } catch (error) {
      console.error("Error al remover al usuario:", error.response?.data?.message || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo remover al usuario. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const registrarVisita = (idhc, nombre, apellido) => {

    navigation.navigate("Historia Medica", {
      screen: "AgregarVisitaMedica",
      params: { 
        hcIdIntegrante: idhc,
        hcNombre: nombre,
        hcApellido: apellido,
      },
    })
  };

  const informe = (idhc, nombre, apellido) => {
    navigation.navigate("Informes", {
      screen: "InformesList",
      params: { 
        hcIdIntegrante: idhc,
        hcNombre: nombre,
        hcApellido: apellido,
      },
    })
  };

  const decline = async (id) => {
    try {
      setLoading(true);
      await AxiosHealth.delete(`gruposFamiliares/deleteNotificacion/${id}`);
      fetchGrupoDetalles();
    } catch (error) {
      console.error("Error al rechazar solicitud:", error.response?.data?.message || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo rechazar la solicitud. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id) => {
    try {
      setLoading(true);
      await AxiosHealth.post(`gruposFamiliares/${grupoId}/aceptarNotificacion/${id}`);
      fetchGrupoDetalles();
    } catch (error) {
      console.error("Error al aceptar solicitud:", error.response?.data?.message || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo aceptar la solicitud. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const openManageDialog = (miembro) => {
    setSelectedMember(miembro);
    setManageDialogVisible(true);
  };

  const otorgarPermisosAdministrador = async (miembro) => {
    try {
      setLoading(true);
      await AxiosHealth.put(`/gruposFamiliares/${grupoId}/agregarAdmin`, {
        usuarioMail: miembro.mail,
      });
      Alert.alert(
        "Éxito",
        `Se han otorgado permisos de administrador a ${miembro.nombre}`
      );
      await fetchGrupoDetalles();
    } catch (error) {
      console.error("Error otorgando permisos de administrador:", error.response?.data?.message || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudieron otorgar los permisos. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const eliminarPermisosAdministrador = async (miembro) => {
    try {
      setLoading(true);
      await AxiosHealth.put(`/gruposFamiliares/${grupoId}/removerAdmin`, {
        usuarioMail: miembro.mail,
      });
      Alert.alert(
        "Éxito",
        `Se han eliminado los permisos de administrador de ${miembro.nombre}`
      );
      fetchGrupoDetalles();
    } catch (error) {
      console.error("Error eliminando permisos de administrador:", error.response?.data?.message || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudieron eliminar los permisos. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setLoading(true);
      await AxiosHealth.put(`/gruposFamiliares/${grupoId}/removerUsuario`, {
        usuarioMail: firstMemberEmail,
      });
      setLeaveDialogVisible(false);
      Alert.alert("Éxito", "Has abandonado el grupo.");
      navigation.goBack();
    } catch (error) {
      console.error("Error al abandonar el grupo:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data || "No se pudo abandonar el grupo. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const isAdminCurrentUser =
    loggedUserMail && admins.some((admin) => admin.mail.toLowerCase() === loggedUserMail.toLowerCase());
  const isSelectedMemberAdmin =
    selectedMember &&
    admins.some((admin) => admin.mail.toLowerCase() === selectedMember.mail.toLowerCase());


  return (
    <ScrollView style={styles.container}>
      <AlertCustom
        visible={showAlertSuccess}
        onClose={() => setShowAlertSuccess(false)}
        title="¡Perfecto!"
        message={`Se invitó a ${emailToInvite}`}
        buttons={[
          {
            text: "Aceptar",
            onPress: () => setShowAlertSuccess(false),
          },
        ]}
      />

      <View style={globalStyles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.header}>{nombreGrupoActual}</Text>
          {isAdminCurrentUser && (
            <TouchableOpacity onPress={() => setEditGroupNameDialogVisible(true)}>
              <Icon name="edit" type="material" />
            </TouchableOpacity>
          )}
        </View>
        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Miembros del Grupo</Text>
          <Text style={styles.sectionDescription}>
            Aquí se listan los usuarios actuales del grupo.
          </Text>
          {miembros.length > 0 ? (
            miembros.map((miembro) => {
              const historiaMedicaId = getHistoriaMedicaIdByEmail(miembro.mail);
              const miembroEsAdmin = admins.some(
                (admin) => admin.mail.toLowerCase() === miembro.mail.toLowerCase()
              );

              return (
                <Card key={miembro.id} containerStyle={globalStyles.solicitudCard}>
                  <View style={globalStyles.solicitudCardContent}>
                    <TouchableOpacity
                      onPress={() => isAdminCurrentUser && toggleIconsVisibility(miembro.id)}
                      style={styles.touchableOpacity}
                    >
                      <Text
                        style={[
                          globalStyles.userName,
                          miembroEsAdmin && { fontWeight: "bold", color: "black" },
                        ]}
                      >
                        {miembro.nombre}
                      </Text>
                      {isAdminCurrentUser && (
                        <Icon
                          name={
                            expandedMemberId === miembro.id
                              ? "keyboard-arrow-up"
                              : "keyboard-arrow-down"
                          }
                          type="material"
                          size={24}
                        />
                      )}
                    </TouchableOpacity>
                    {isAdminCurrentUser && expandedMemberId === miembro.id && (
                      <View style={globalStyles.solicitudIconContainer}>
                        <Button
                          title="Gestionar"
                          buttonStyle={{
                            ...globalStyles.buttonStyle,
                            marginRight: 10,
                          }}
                          onPress={() => openManageDialog(miembro)}
                        />
                        <Button
                          title="Informe"
                          onPress={() => {
                            if (historiaMedicaId) {
                              informe(historiaMedicaId, miembro.nombre, miembro.apellido);
                            } else {
                              Alert.alert(
                                "Error",
                                "No se pudo obtener el ID de Historia Clínica del miembro."
                              );
                            }
                          }}
                          buttonStyle={{
                            ...globalStyles.buttonStyle,
                            marginRight: 10,
                          }}
                        />
                        <Button
                          title="Registrar Visita"
                          buttonStyle={globalStyles.buttonStyle}
                          onPress={() =>
                            registrarVisita(
                              historiaMedicaId,
                              miembro.nombre,
                              miembro.apellido
                            )
                          }
                        />
                      </View>
                    )}
                  </View>
                </Card>
              );
            })
          ) : (
            <Text>No hay miembros en el grupo.</Text>
          )}
          {isAdminCurrentUser && (
            <>
              <Button
                buttonStyle={globalStyles.buttonStyle}
                title="INVITAR NUEVO MIEMBRO"
                onPress={() => setDialogVisible(true)}
              />
              <Button
                buttonStyle={{
                  ...globalStyles.buttonStyle,
                  backgroundColor: globalStyles.deleteColor as ColorValue,
                }}
                title="ABANDONAR GRUPO"
                onPress={() => setLeaveDialogVisible(true)}
              />
            </>
          )}
        </View>
      </View>

      {isAdminCurrentUser && (
        <>
          {/* Diálogo para Invitar Miembros */}
          <Dialog
            isVisible={isDialogVisible}
            onBackdropPress={() => setDialogVisible(false)}
            overlayStyle={styles.dialogOverlay}
          >
            <Dialog.Title title="IMPORTANTE" />
            <Text>
              Para que el usuario pueda ingresar a su grupo, deberá acceder mediante
              el código de invitación que se le enviará al correo electrónico que
              ingrese a continuación.
            </Text>
            <Formik
              initialValues={{ email: "" }}
              validationSchema={Yup.object().shape({
                email: Yup.string()
                  .email("Ingrese un correo electrónico válido")
                  .required("El correo electrónico es obligatorio"),
              })}
              onSubmit={handleInviteMember}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
              }) => (
                <View>
                  <Input
                    placeholder="Ingrese correo electrónico"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    errorMessage={errors.email}
                  />
                  <View style={globalStyles.agruparBotones}>
                    <Button
                      title="Enviar Invitación"
                      onPress={handleSubmit}
                      buttonStyle={{ ...globalStyles.buttonStyle, marginRight: 10 }}
                    />
                    <Button
                      title="Volver"
                      onPress={() => setDialogVisible(false)}
                      buttonStyle={globalStyles.buttonStyle}
                    />
                  </View>
                </View>
              )}
            </Formik>
          </Dialog>

          {/* Diálogo para Gestionar Miembros */}
          <Dialog
            isVisible={isManageDialogVisible}
            onBackdropPress={() => setManageDialogVisible(false)}
            overlayStyle={styles.dialogOverlay}
          >
            <Dialog.Title title="Importante" />
            <Text>
              Los usuarios expulsados no podrán volver a ser gestionados y ya no
              podrá visualizar su historial médico. Es posible que el usuario con el
              código de Grupo vuelva a ingresar si así lo desea. En caso que otorgue
              permisos de administrador a un usuario, éste podrá expulsar a otros
              miembros, otorgar permisos de administrador e incluso expulsarlo a
              usted.
            </Text>
            <View style={{ alignSelf: "center" }}>
              <Button
                title="Expulsar"
                onPress={() => handleExpulsar(selectedMember)}
                buttonStyle={globalStyles.buttonStyle}
              />
              {isSelectedMemberAdmin ? (
                <Button
                  title="Quitar como administrador"
                  onPress={() => {
                    eliminarPermisosAdministrador(selectedMember);
                    setManageDialogVisible(false);
                  }}
                  buttonStyle={globalStyles.buttonStyle}
                />
              ) : (
                <Button
                  title="Otorgar como administrador"
                  onPress={() => {
                    otorgarPermisosAdministrador(selectedMember);
                    setManageDialogVisible(false);
                  }}
                  buttonStyle={globalStyles.buttonStyle}
                />
              )}
              <Button
                title="Volver"
                onPress={() => setManageDialogVisible(false)}
                buttonStyle={globalStyles.buttonStyle}
              />
            </View>
          </Dialog>

          {/* Diálogo para Abandonar Grupo */}
          <Dialog
            isVisible={isLeaveDialogVisible}
            onBackdropPress={() => setLeaveDialogVisible(false)}
            overlayStyle={styles.dialogOverlay}
          >
            <Dialog.Title title="IMPORTANTE" />
            <Text>
              Si abandona el grupo perderá sus privilegios de administrador. Podrá
              volver a ingresar al Grupo si el nuevo Administrador lo invita a
              participar del grupo y eventualmente pudiera ser asignado como
              Administrador.
            </Text>
            <View style={globalStyles.agruparBotones}>
              <Button
                title="ABANDONAR"
                onPress={handleLeaveGroup}
                buttonStyle={{
                  ...globalStyles.buttonStyle,
                  backgroundColor: globalStyles.deleteColor as ColorValue,
                  marginRight: 10,
                }}
              />
              <Button
                title="VOLVER"
                onPress={() => setLeaveDialogVisible(false)}
                buttonStyle={globalStyles.buttonStyle}
              />
            </View>
          </Dialog>

          {/* Diálogo para Editar Nombre del Grupo */}
          <Dialog
            isVisible={isEditGroupNameDialogVisible}
            onBackdropPress={() => setEditGroupNameDialogVisible(false)}
            overlayStyle={styles.dialogOverlay}
          >
            <Dialog.Title title="Edición de Grupo" />
            <Text>
              El mismo podrá ser editado nuevamente en el futuro si así lo desea.
            </Text>
            <Input
              placeholder="Nuevo nombre para el grupo"
              onChangeText={(text) => setNombreGrupoEditar(text)}
              value={nombreGrupoEditar}
            />
            <View style={globalStyles.agruparBotones}>
              <Button
                title="Cambiar"
                onPress={handleConfirmEditGroupName}
                buttonStyle={{ ...globalStyles.buttonStyle, marginRight: 10 }}
              />
              <Button
                title="Volver"
                onPress={() => setEditGroupNameDialogVisible(false)}
                buttonStyle={globalStyles.buttonStyle}
              />
            </View>
          </Dialog>

          {/* Alerta para Confirmar Expulsión */}
          <AlertCustom
            visible={showAlertEliminar}
            onClose={() => setShowAlertEliminar(false)}
            title="Confirmación"
            message={`¿Está seguro que desea expulsar al miembro ${miembroSeleccionado?.nombre}?`}
            buttons={[
              {
                text: "Cancelar",
                onPress: () => setShowAlertEliminar(false),
                style: "cancel",
              },
              {
                text: "Confirmar",
                onPress: () => {
                  bajarIntegrante(miembroSeleccionado.id, miembroSeleccionado.mail);
                  setShowAlertEliminar(false);
                  setManageDialogVisible(false);
                },
                style: "destructive",
              },
            ]}
          />

          {/* Alerta para Confirmar Invitación */}
          <AlertCustom
            visible={showAlert}
            onClose={() => setShowAlert(false)}
            title="Confirmación"
            message={`¿Está seguro que desea enviar la invitación al correo: ${emailToInvite}?`}
            buttons={[
              {
                text: "Cancelar",
                onPress: () => {
                  setShowAlert(false); 
                },
                style: "cancel",
              },
              {
                text: "Confirmar",
                onPress: async () => {
                  setShowAlert(false); 
                  try {
                    await handleConfirm(); 
                  } catch (error) {
                    console.error("Error en la confirmación:", error);
                  }
                },
              },
            ]}
          />
        </>
      )}

      {isAdminCurrentUser && (
        <View style={globalStyles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitudes de unión</Text>
            <Text style={styles.sectionDescription}>
              Aquí se listan los usuarios que solicitaron ingresar al Grupo.
            </Text>
            {solicitudes.length > 0 ? (
              solicitudes.map((solicitud) => (
                <Card key={solicitud.id} containerStyle={globalStyles.solicitudCard}>
                  <View style={globalStyles.solicitudCardContent}>
                    <TouchableOpacity
                      style={styles.touchableOpacity}
                      onPress={() => toggleRequestIconsVisibility(solicitud.id)}
                    >
                      <Text style={globalStyles.userName}>
                        {solicitud.usuarioNombre} ({solicitud.usuarioMail})
                      </Text>
                      <Icon
                        name={
                          expandedRequestId === solicitud.id
                            ? "keyboard-arrow-up"
                            : "keyboard-arrow-down"
                        }
                        type="material"
                        size={24}
                      />
                    </TouchableOpacity>
                    {expandedRequestId === solicitud.id && (
                      <View style={globalStyles.solicitudIconContainer}>
                        <TouchableOpacity
                          style={globalStyles.solicitudIconButton}
                          onPress={() => accept(solicitud.id)}
                        >
                          <Icon name="check" type="material" color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={globalStyles.solicitudIconButton}
                          onPress={() => decline(solicitud.id)}
                        >
                          <Icon name="close" type="material" color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </Card>
              ))
            ) : (
              <Text>No hay solicitudes pendientes.</Text>
            )}
          </View>

          <Button
            buttonStyle={globalStyles.buttonStyle}
            title="VOLVER"
            onPress={() => navigation.goBack()}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 8,
  },
  dialogOverlay: {
    width: "90%",
    alignSelf: "center",
  },
  touchableOpacity: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default GrupoDetalles;
