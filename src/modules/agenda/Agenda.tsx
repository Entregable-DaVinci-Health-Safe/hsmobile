import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { Text } from "@rneui/themed";
import EntityCard from "../../components/EntityCard";
import { useAgenda } from "./hooks/useAgenda";
import AlertCustom from "../../components/AlertCustom";
import ButtonHealth from "../../components/ButtonHealth";
import { borrarEventoGoogleCalendar } from "./services/useAgendaTurnosServices";
const AgendaTurnos = ({ navigation }) => {
  const { turnos, loading, error, deleteTurnos, refetch, restoreTurno, } = useAgenda(navigation);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [googleidSeleccionado, setGoogleidSeleccionado] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    
    const unsubscribe = navigation.addListener("focus", () => {
      refetch();
    });

    
    return unsubscribe;
  }, [navigation, refetch]);

  
  const solicitarEliminarTurno = (id, googleId) => {
    setTurnoSeleccionado(id);
    setShowConfirmDelete(true);
    setGoogleidSeleccionado(googleId);
  };

  const eliminarTurno = async (id, idgoogle) => {
    setShowConfirmDelete(false); 
    setTurnoSeleccionado(null); 
    try {
      await borrarEventoGoogleCalendar(googleidSeleccionado);
      await deleteTurnos(id, idgoogle);
      await refetch(); 
    } catch (e) {
      console.error("Error al eliminar el turno:", e);
    }
  };

  const agregarAgenda = (modoEdicion) => {
    navigation.navigate("AgendaTurnosAgregar", { modoEdicion });
  };

  const restaurarTurno = async (id) => {
    try {
      await restoreTurno(id);
      await refetch(); 
    } catch (e) {
      console.error("Error al restaurar el turno:", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && <Text>Cargando turnos...</Text>}
        {error && (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        )}

        {!loading && !error && turnos.length === 0 && (
          <Text>No hay turnos disponibles.</Text>
        )}

        {Array.isArray(turnos) && turnos.length > 0 ? (
          turnos.map((turno) => {
            const limpiarCampo = (valor) => {
              if (!valor) return "";

              const sinPregunta = valor.split("?")[0];
              const partes = sinPregunta.split(":");
              return partes[partes.length - 1];
            };

            const motivoLimpio = limpiarCampo(turno.motivo);
            const horaLimpia = limpiarCampo(turno.hora);
            const profesionalLimpio = limpiarCampo(turno.profesional);
            const institucionLimpia = limpiarCampo(turno.institucion);
            const comentariosLimpios = limpiarCampo(turno.especialidad);

            return (
              <EntityCard
                key={turno.id}
                agenda={true}
                title={motivoLimpio}
                fecha={turno.fechaInicio}
                hora={horaLimpia}
                profesional={profesionalLimpio}
                institucion={institucionLimpia}
                comentarios={comentariosLimpios}
                googleCalendar={turno.googleId}
                onDelete={turno.activo ? () => solicitarEliminarTurno(turno.id, turno.googleId) : undefined}
                onEdit={turno.activo ? () => navigation.navigate("AgendaTurnosAgregar", { modoEdicion: true, turno }) : undefined}
                onRestoreTurno={!turno.activo ? () => restaurarTurno(turno.id) : undefined}
              />
            );
          })
        ) : (
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 16,
              color: "gray",
            }}
          >
            No hay turnos disponibles.
          </Text>
        )}
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <ButtonHealth
          iconName="add-sharp"
          iconLibrary="Ionicons"
          onPress={() => agregarAgenda(false)}
        />
        <ButtonHealth title="Volver" onPress={() => navigation.goBack()} />
      </View>

      <AlertCustom
        visible={showConfirmDelete}
        title="Eliminar Turno"
        message="¿Está seguro que desea eliminar este turno?"
        buttons={[
          {
            text: "Sí, eliminar",
            onPress: () => eliminarTurno(turnoSeleccionado,),
            style: "destructive",
          },
          {
            text: "Cancelar",
            onPress: () => {
              setShowConfirmDelete(false);
              setTurnoSeleccionado(null);
            },
            style: "cancel",
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
  },
  buttonsContainer: {
    height: "15%",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    backgroundColor: "#F0F0F0",
  },
});

export default AgendaTurnos;
