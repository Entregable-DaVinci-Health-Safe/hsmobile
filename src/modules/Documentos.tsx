import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  Linking,

} from "react-native";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import AxiosHealth from "../Interceptor/AxiosHealth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Divider } from "@rneui/base";
import NoItems from "../components/NoItems"; // Asegúrate de importar el componente correctamente
import { StyleSheet } from "react-native";

const Documentos = ({ route }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    const idHc = await AsyncStorage.getItem("idHc");

    try {
      const response = await AxiosHealth.get(
        `/historiasMedicas/${idHc}/visitasMedicasWithDocuments`
      );
      setDocuments(response.data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const deleteDocument = async (option) => {
    const idHc = await AsyncStorage.getItem("idHc");
    try {
      option.tipo === "Receta"
        ? await AxiosHealth.delete(`/prescripciones/${idHc}/recetas/${option.id}`)
        : await AxiosHealth.delete(`/prescripciones/${idHc}/estudios/${option.id}`);
      
      await fetchDocuments();
      
      Alert.alert("Eliminado", "El documento ha sido eliminado exitosamente.");
    } catch (error) {
      console.error("Error eliminando documento:", error);
      Alert.alert("Error", "Hubo un problema al eliminar el documento.");
    }
  };

  const confirmDeleteDocument = (option) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar este documento (${option.tipo})?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => deleteDocument(option),
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <NoItems customText="Hubo un error al cargar los documentos." />;
  }

  const filteredDocuments = documents.filter(
    (doc) => doc.prescripciones && doc.prescripciones.length > 0
  );

  return (
    <View style={{ flex: 1 }}>
      {filteredDocuments.length === 0 ? (
        <NoItems customText="No hay documentos con prescripciones disponibles." />
      ) : (
        <ScrollView>
          {filteredDocuments.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha de visita:</Text>
                <Text style={styles.value}>{item.fechaVisita}</Text>
              </View>
              <Divider />
              {item.prescripciones.map((prescripcion, presIndex) => (
                <View key={presIndex}>
                  <Text style={styles.label}>País:</Text>
                  <Text style={styles.value}>{prescripcion.pais}</Text>
                  {prescripcion.recetas && prescripcion.recetas.length > 0 ? (
                    prescripcion.recetas.map((receta, recetaIndex) => (
                      <View key={recetaIndex}>
                        <Divider />
                        <View style={styles.row}>
                          <Text style={styles.label}>Tipo:</Text>
                          <Text style={styles.value}>{receta.tipo}</Text>
                        </View>
                        <Divider />
                        <View style={styles.row}>
                          <Text style={styles.label}>Descripción:</Text>
                          <Text style={styles.value}>
                            {receta.descripcion || "Sin descripción"}
                          </Text>
                        </View>
                        <Divider />
                        <View style={styles.actions}>
                          {receta.url && (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => Linking.openURL(receta.url)}
                            >
                              <Entypo name="eye" size={24} color="#fff" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.actionButtonDelete}
                            onPress={() =>
                              confirmDeleteDocument({ id: receta.id, tipo: "Receta" })
                            }
                          >
                            <MaterialIcons name="delete" size={24} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text>No hay recetas disponibles</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  label: {
    fontWeight: "bold", 
    color: "#333",
  },
  value: {
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
    actionButton: {
    backgroundColor: "#4F8EF7",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center", // Correcto: React Native acepta "center"
    justifyContent: "center",
    marginHorizontal: 5,
    flex: 1,
  },
  actionButtonDelete: {
    backgroundColor: "#FF6961",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center", // Correcto: React Native acepta "center"
    justifyContent: "center",
    marginHorizontal: 5,
    flex: 1,
  },
});

export default Documentos;
