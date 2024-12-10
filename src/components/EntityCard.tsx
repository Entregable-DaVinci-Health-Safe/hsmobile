import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Button } from "@rneui/themed";
import { Entypo, AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";

type EntityCardProps = {
  title?: string; // Título principal de la tarjeta
  subtitle1?: string; // Subtítulo o información adicional 1
  subtitle2?: string; // Subtítulo o información adicional 2
  onEdit?: () => void; // Acción para editar
  onDelete?: () => void; // Acción para eliminar
  onRestoreTurno?: () => void; // Acción para restaurar un turno
  googleCalendar?: boolean; // Indica si está conectado al Google Calendar
  agenda?: boolean; // Indica si el diseño es de una agenda
  fecha?: string; // Fecha para mostrar en una agenda
  hora?: string; // Hora para mostrar en una agenda
  direccion?: string; // Dirección para mostrar en una agenda
  profesional?: string; // Profesional relacionado con una agenda
  institucion?: string; // Institución relacionada con una agenda
  comentarios?: string; // Comentarios adicionales
  diagnostico?: string; // Diagnóstico en caso de visitas médicas
  indicaciones?: string; // Indicaciones para visitas médicas
  piso?: string; // Piso relacionado con la institución
  departamento?: string; // Departamento relacionado con la institución
  referencia?: string; // Referencia adicional
  isInstitucion?: boolean; // Indica si la tarjeta corresponde a una institución
  isVisitaMedica?: boolean; // Indica si la tarjeta corresponde a una visita médica
  isProfesional?: boolean; // Indica si la tarjeta corresponde a un profesional
  isMedicamentos?: boolean; // Indica si la tarjeta corresponde a medicamentos
  contactos?: { telefono?: string; mailAlternativo?: string }; // Información de contacto
};

const EntityCard: React.FC<EntityCardProps> = ({
  title = "",
  subtitle1 = "",
  subtitle2 = "",
  onEdit,
  onDelete,
  onRestoreTurno,
  googleCalendar = false,
  agenda = false,
  fecha = "",
  hora = "",
  direccion = "",
  profesional = "",
  institucion = "",
  comentarios = "",
  diagnostico = "",
  indicaciones = "",
  piso = "",
  departamento = "",
  referencia = "",
  isInstitucion = false,
  isVisitaMedica = false,
  isProfesional = false,
  isMedicamentos = false,
}) => {
  return (
    <Card containerStyle={styles.cardBody}>
      <View style={styles.titleContainer}>
        {title && <Card.Title style={styles.title}>{title}</Card.Title>}
        {agenda && googleCalendar && (
          <Ionicons
            name="notifications-sharp"
            size={22}
            color="black"
            style={styles.icon}
          />
        )}
      </View>
      <Card.Divider />

      {/* Lógica para Agendas */}
      {agenda ? (
        <>
          <Text style={styles.agendaText}>
            Fecha y hora: {fecha || "dd/mm/yyyy"}
          </Text>
          <Text style={styles.agendaText}>
            Dirección: {direccion || "Av. Unlugar 1796"}
          </Text>
          <Text style={styles.agendaText}>
            Profesional: {profesional || "Profesional 1"}
          </Text>
          <Text style={styles.agendaText}>
            Institución: {institucion || "Institución 1"}
          </Text>
          {comentarios && (
            <Text style={styles.agendaText}>
              Comentarios: {comentarios || "-"}
            </Text>
          )}
        </>
      ) : (
        <>
          {/* Lógica para Profesionales */}
          {isProfesional && (
            <>
              {subtitle1 && (
                <View style={styles.row}>
                  <MaterialIcons
                    name="phone"
                    size={22}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{subtitle1}</Text>
                </View>
              )}
              {subtitle2 && (
                <View style={styles.row}>
                  <MaterialIcons
                    name="email"
                    size={22}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{subtitle2}</Text>
                </View>
              )}
            </>
          )}

          {/* Lógica para Instituciones */}
          {isInstitucion && (
            <>
              {direccion && (
                <View style={styles.row}>
                  <Entypo
                    name="location-pin"
                    size={22}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{direccion}</Text>
                </View>
              )}
              {(piso || departamento) && (
                <View style={styles.row}>
                  <Entypo
                    name="location-pin"
                    size={22}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.text}>
                    Piso: {piso || "N/A"} | Depto: {departamento || "N/A"}
                  </Text>
                </View>
              )}
              {referencia && (
                <View style={styles.row}>
                  <Entypo
                    name="help-with-circle"
                    size={22}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{referencia}</Text>
                </View>
              )}
            </>
          )}

          {/* Lógica para Visitas Médicas */}
          {isVisitaMedica && (
  <>
    {diagnostico && (
      <View style={styles.row}>
        <MaterialIcons
          name="healing"
          size={22}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.text}>Diagnóstico: {diagnostico || "Sin diagnóstico"}</Text>
      </View>
    )}
    {indicaciones && (
      <View style={styles.row}>
        <MaterialIcons
          name="notes"
          size={22}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.text}>Indicaciones: {indicaciones || "Sin indicaciones"}</Text>
      </View>
    )}
    {profesional && (
      <View style={styles.row}>
        <MaterialIcons
          name="person"
          size={22}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.text}>Profesional: {profesional || "Sin profesional"}</Text>
      </View>
    )}
    {institucion && (
      <View style={styles.row}>
        <MaterialIcons
          name="business"
          size={22}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.text}>Institución: {institucion || "Sin institución"}</Text>
      </View>
    )}
    {direccion && (
      <View style={styles.row}>
        <MaterialIcons
          name="location-on"
          size={22}
          color="black"
          style={styles.icon}
        />
        <Text style={styles.text}>Dirección: {direccion || "Sin dirección"}</Text>
      </View>
    )}
  </>
)}


          {/* Lógica para Medicamentos */}
          {isMedicamentos && (
            <>
              {subtitle1 && (
                <View style={styles.row}>
                  <MaterialIcons
                    name="medication"
                    size={22}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{subtitle1}</Text>
                </View>
              )}
              {subtitle2 && (
                <View style={styles.row}>
                  <MaterialIcons
                    name="medication"
                    size={22}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{subtitle2}</Text>
                </View>
              )}
              {comentarios && (
                <View style={styles.row}>
                  <MaterialIcons
                    name="comment"
                    size={22}
                    color="black"
                    style={styles.icon}
                  />
                  <Text style={styles.text}>Comentarios: {comentarios}</Text>
                </View>
              )}
            </>
          )}
        </>
      )}

      <Card.Divider />
      <View style={styles.cardButtons}>
        {onEdit && (
          <Button
            radius="sm"
            type="solid"
            buttonStyle={styles.normalButton}
            onPress={onEdit}
          >
            <AntDesign
              name="edit"
              size={20}
              color="white"
              style={styles.cardButtonIcon}
            />
            <Text style={styles.buttonText}>Editar</Text>
          </Button>
        )}
        {onDelete && (
          <>
            <View style={styles.buttonSpacing} />
            <Button
              type="outline"
              buttonStyle={styles.deleteButton}
              titleStyle={styles.deleteButtonTitle}
              onPress={onDelete}
            >
              <AntDesign
                name="delete"
                size={20}
                color="white"
                style={styles.cardButtonIcon}
              />
              <Text style={styles.buttonText}>Eliminar</Text>
            </Button>
          </>
        )}
        {onRestoreTurno && (
          <>
            <View style={styles.buttonSpacing} />
            <Button
              type="outline"
              buttonStyle={styles.restoreButton}
              titleStyle={styles.restoreButtonTitle}
              onPress={onRestoreTurno}
            >
              <MaterialIcons
                name="restore"
                size={20}
                color="white"
                style={styles.cardButtonIcon}
              />
              <Text style={styles.buttonText}>Restaurar Turno</Text>
            </Button>
          </>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardBody: {
    width: "95%",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#F5F5F5",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
  },
  agendaText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  cardButtonIcon: {
    marginRight: 10,
  },
  normalButton: {
    width: 120,
    backgroundColor: "#4F8EF7",
    borderRadius: 20,
  },
  deleteButton: {
    borderColor: "red",
    backgroundColor: "#FF6961",
    width: 120,
    borderRadius: 20,
  },
  deleteButtonTitle: {
    color: "white",
  },
  restoreButton: {
    borderColor: "green",
    backgroundColor: "#28a745",
    width: 150,
    borderRadius: 20,
  },
  restoreButtonTitle: {
    color: "white",
  },
  buttonSpacing: {
    width: 20,
  },
  buttonText: {
    color: "white",
  },
});

export default EntityCard;
