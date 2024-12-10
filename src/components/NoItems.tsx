import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SvgNoData from "../assets/nodata.svg";

interface NoItemsProps {
  item?: string; // Parámetro opcional para personalizar el texto del elemento
  customText?: string; // Texto libre que sobrescribe el predeterminado
}

const NoItems: React.FC<NoItemsProps> = ({ item, customText }) => {
  return (
    <View style={styles.container}>
      <SvgNoData width={200} height={200} />
      <Text style={styles.text}>
        {customText || `Todo está vacío por aquí! Prueba añadiendo ${item}.`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Centrado vertical
    alignItems: "center", // Centrado horizontal
    paddingHorizontal: 20, // Margen horizontal para pantallas pequeñas
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
});

export default NoItems;
