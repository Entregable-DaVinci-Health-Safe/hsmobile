import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Linking,
  Image,
  Alert,
} from "react-native";
import { Entypo, AntDesign } from "@expo/vector-icons";
import { Button, Card, Icon, Dialog } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { globalStyles } from "../../assets/themed/globalStyle";
import { Table, Row, Cell, TableWrapper } from "react-native-table-component";
import AxiosHealth from "../../Interceptor/AxiosHealth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import firebaseApp from "../../contextos/firebaseDB";
import { useLoading } from "../LoadingContext";
import ButtonHealth from "../ButtonHealth";

const VisitaMedicaDetallada = ({ route, navigation }) => {
  const { visita } = route.params;

  const [dialogVisible, setDialogVisible] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [uriArchivo, setUriArchivo] = useState("");
  const [pickDialogVisible, setPickDialogVisible] = useState(false);
  const [posicionadoCheck, setPosicionadoCheck] = useState(0);
  const { setLoading } = useLoading();

  const tableHead = ["Tipo", "Indicación", "Adjunto"];
  const tableData = visita.prescripciones.flatMap((prescripcion) => [
    ...prescripcion.estudios.map((estudio) => ({
      tipo: estudio.tipo,
      descripcion: estudio.descripcion,
      url: estudio.url,
      isLink: true,
    })),
    ...prescripcion.recetas.map((receta) => ({
      tipo: receta.tipo,
      descripcion: receta.descripcion,
      url: receta.url,
      isLink: true,
    })),
  ]);

  const renderCell = (data, index) => {
    if (data.isLink) {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(data.url)}>
          <View style={tableStyles.btn}>
            <Entypo name="eye" color="#517fa4" size={24} />
          </View>
        </TouchableOpacity>
      );
    } else {
      return <Text style={tableStyles.text}>{data}</Text>;
    }
  };

  const tableStyles = StyleSheet.create({
    head: { backgroundColor: "#ccd3d9" },
    text: { margin: 6, textAlign: "center" },
    row: { flexDirection: "row", backgroundColor: "white" },
    btn: { alignItems: "center" },
  });

  const handleImagePick = async () => {
    setPickDialogVisible(false); 
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setUriArchivo(result.assets[0].uri);
      setNombreArchivo(result.assets[0].uri.split("/").pop() || "image");
      setDialogVisible(true); 
    }
  };

  const handleDocumentPick = async () => {
    setPickDialogVisible(false); 
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });

    if (result.type !== "cancel") {
      setUriArchivo(result.uri);
      setNombreArchivo(result.name || "document");
      setDialogVisible(true); 
    }
  };

  const handleFileUpload = async () => {
    try {
      setLoading(true, "Subiendo documento...");
      const response = await fetch(uriArchivo);
      const blob = await response.blob();
      const nombreUnico = `Historia_${new Date().getTime()}`;
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `Prescripcion/${nombreUnico}`);
      await uploadBytes(storageRef, blob);
      const urlDescarga = await getDownloadURL(storageRef);
      const tipoDocumento = ["Receta", "Estudio", "Resultado"][posicionadoCheck];

      const presResponse = await AxiosHealth.post(`/prescripciones`, {
        pais: "Argentina",
        visitaMedicaId: visita.id,
      });

      const tipoURL =
        tipoDocumento === "Estudio" || tipoDocumento === "Resultado"
          ? `/prescripcion/${presResponse.data.id}/crearEstudio`
          : `prescripcion/${presResponse.data.id}/crearReceta`;

      await AxiosHealth.post(tipoURL, {
        tipo: tipoDocumento,
        url: urlDescarga.toString(),
      });

      setDialogVisible(false);
      setLoading(false, "");
    } catch (error) {
      setLoading(false, "");
      console.error("Error al subir el archivo:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al subir el archivo. Intente nuevamente."
      );
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
      <Card>
        <View style={globalStyles.header}>
          <Text style={globalStyles.headerText}>Registro #{visita.id}</Text>
          <View style={globalStyles.iconsContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("AgregarVisitaMedica", {
                  visita,
                  modoEdicion: true,
                })
              }
            >
              <Icon
                name="edit"
                color="#517fa4"
                style={globalStyles.icon as any}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPickDialogVisible(true)}>
              <AntDesign name="paperclip" color="#517fa4" size={24} style={globalStyles.icon} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={globalStyles.divider} />
        <View style={globalStyles.detailRow}>
          <Text style={globalStyles.detailLabel}>Fecha</Text>
          <Text style={globalStyles.detailContent}>{visita.fechaVisita}</Text>
        </View>
        <View style={globalStyles.divider} />
        <View style={globalStyles.detailRow}>
          <Text style={globalStyles.detailLabel}>Institución</Text>
          <Text style={globalStyles.detailContent}>
            {visita.institucionSalud.nombre}
          </Text>
        </View>
        <View style={globalStyles.divider} />
        <View style={globalStyles.detailRow}>
          <Text style={globalStyles.detailLabel}>Profesional</Text>
          <Text style={globalStyles.detailContent}>
            {visita.profesional.nombre}
          </Text>
        </View>
        <View style={globalStyles.divider} />
        <View style={globalStyles.detailRow}>
          <Text style={globalStyles.detailLabel}>Diagnóstico</Text>
          <Text style={globalStyles.detailContent}>
            {visita.diagnostico.nombre}
          </Text>
        </View>
        <View style={globalStyles.divider} />
        <View style={globalStyles.detailRow}>
          <Text style={globalStyles.detailLabel}>Atención virtual</Text>
          <Text style={globalStyles.detailContent}>
            {visita.atencionVirtual ? "Sí" : "No"}
          </Text>
        </View>
        <View style={globalStyles.divider} />
        <Text style={globalStyles.detailLabel}>Indicaciones</Text>
        <Text style={globalStyles.detailContent}>
        <Text>{visita.indicaciones}</Text>
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            marginLeft: 5,
            marginTop: 10,
          }}
        >
          Adjuntos Asociados
        </Text>
        <View style={globalStyles.divider} />
        {tableData.length > 0 ? ( 
          <Table
            borderStyle={{ borderWidth: 1, borderColor: "#ccd3d9" }}
            style={{ marginTop: 10 }}
          >
            <Row
              data={tableHead}
              style={tableStyles.head}
              textStyle={tableStyles.text}
            />
            {tableData.map((rowData, index) => (
              <TableWrapper key={index} style={tableStyles.row}>
                <Cell data={rowData.tipo} textStyle={tableStyles.text} />
                <Cell data={rowData.descripcion} textStyle={tableStyles.text} />
                <Cell data={renderCell(rowData, index)} />
              </TableWrapper>
            ))}
          </Table>
        ) : (
          <Text style={tableStyles.text}>No hay adjuntos</Text> 
        )}
      </Card>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}>
  <ButtonHealth
    title="Volver"
    onPress={() => {
      navigation.navigate("Historia Medica", {
        screen: "HistoriaMedicaList",
        params: { modoEdicion: false },
      })
    }}
    size="large"
  />
</View>

      <Dialog
        isVisible={pickDialogVisible}
        onBackdropPress={() => setPickDialogVisible(false)} 
      >
        <Dialog.Title title="Seleccione el tipo de archivo" />
        <View style={styles.dialogOptionsContainer}>
          <TouchableOpacity style={styles.option} onPress={handleImagePick}>
            <Entypo name="images" color="#517fa4" size={80} />
            <Text style={styles.optionText}>Imagen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={handleDocumentPick}>
            <Entypo name="text-document" color="#517fa4" size={80} />
            <Text style={styles.optionText}>Documento</Text>
          </TouchableOpacity>
        </View>
        <ButtonHealth title="Cancelar" onPress={() => setPickDialogVisible(false)} />
      </Dialog>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dialogOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap:50,
    marginVertical: 20,
  },
  option: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  optionText: {
    marginTop: 10,
    fontSize: 16,
    color: "#517fa4",
    textAlign: "center",
  },

});
export default VisitaMedicaDetallada;
