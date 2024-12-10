import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "white",
    shadowColor: "#000",
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 16,
  },

  //BOTONES UNO AL LADO DEL OTRO
  agruparBotones: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  separadorBotones: {
    marginHorizontal: 20,
  },

  //BOTONES UNO AL LADO DEL OTRO

  containerStyle: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerAddressStyle: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainerStyle: {
    width: '100%',
    maxWidth: 800,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputContainerStyle: {
    borderWidth: 1,
    width: '100%',
    marginVertical: 12,
    borderColor: "#86939e",
    paddingHorizontal: 10,
  },
  inputWidth100: {
    width: "100%",
  },
  inputStyle: {
    textAlignVertical: "center",
  },
  overlayStyle: {
    width: "100%",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#86939e",
    width: "95%",
    paddingHorizontal: 10,
    marginBottom: 25,
    marginRight: "auto",
    marginLeft: "auto",
    height: 45,
  },
  buttonStyle: {
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
  buttonPrueba: {
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
  titleStyle: {
    fontSize: 18,
  },

  //CASO ESPECIFICO DE BOTON CENTRADO ADJUNTAR
  centradoAdjuntar: {
    justifyContent: "center",
    alignItems: "center",
  },

  buttonAdjuntar: {
    width: "50%",
    alignSelf: "center",
  },
  //CASO ESPECIFICO DE BOTON CENTRADO ADJUNTAR

  //CASO ESPECIFICO DE LISTADO VISITA MEDICA
  card: {
    // backgroundColor: 'white',
    // borderRadius: 4,
    // borderWidth: 1,
    // borderColor: '#e1e1e1',
    // padding: 10,

    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },

  groupCard: {
    padding: 0,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  groupName: {
    fontSize: 16,
  },
  groupActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  helperText: {
    fontSize: 12,
    color: "#777",
    marginBottom: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  icon: {
    marginLeft: 20,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  toggle: {
    marginRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#e1e1e1",
    marginVertical: 5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#555",
  },
  detailContent: {
    color: "#333",
  },
  //CASO ESPECIFICO DE LISTADO VISITA MEDICA

  //CASO DROPDOWN/INPUTS/MULTISELECT

  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  selectedItemContainer: {
    backgroundColor: "#d1e7dd", // Color de fondo para el elemento seleccionado
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    margin: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedItemText: {
    color: "#0f5132", // Color del texto para el elemento seleccionado
    marginRight: 4,
  },
  removeItem: {
    color: "#d9534f", // Color del texto para el botón de eliminar
    paddingHorizontal: 4,
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1e7dd", // Color de fondo para el elemento seleccionado
    borderRadius: 4,
    margin: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  //CASO DROPDOWN/INPUTS/MULTISELECT

  //CASO MISMA LINEA
  linealContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    alignItems: "center",
  },
  //CASO MISMA LINEA

  //CASO ALERT BOTONES

  errorColor: "#DD6B55",
  warningColor: "#FFD700",
  successColor: "#00C851",
  deleteColor: "#DD6B55",

  //CASO ALERT BOTONES

  //CASO BOTONES
  cancelColor: {
    backgroundColor: "#FF0000", // Este es un ejemplo de color rojo
  },
  //CASO BOTONES

  //CASO CARD DISABLED
  disabledCard: {
    backgroundColor: "#CCCCCC",
  },
  //CASO CARD DISABLED

  // Estilos para las tarjetas de solicitud
  cardTouchable: {
    flex: 1,
  },
  solicitudCard: {
    margin: 5,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  solicitudCardContent: {
    flexDirection: "column",
  },
  userName: {
    fontSize: 16,
    marginBottom: 5,
  },
  solicitudIconContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 5,
  },
  solicitudIconButton: {
    padding: 5,
  },
  toggleIcon: {
    alignSelf: 'flex-end', // Alinea el icono al final de la tarjeta
    padding: 10, // Espacio suficiente para tocar fácilmente
  },

  cardContent: {
    flexDirection: 'column',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },

  //Vacunas CARD
  chipContainer: {
    marginLeft: 60,
  },
  accordionDetails: {
    padding: 10,
  },
  vacunaItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  vacunaText: {
    flex: 1, // Esto permite que el texto ocupe el espacio disponible
  },
  accordionContainer: {
    paddingVertical: 10,
  },
  selectedAccordion: {
    backgroundColor: '#d3d3d3',
  },
  //Vacunas CARD


});




