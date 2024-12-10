import React, { useState, useEffect } from "react";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { StyleSheet, View, Text } from "react-native";
import { BlurView } from "expo-blur";
import * as Icons from "@expo/vector-icons";
import { FormikErrors } from "formik";

interface DropdownOption {
  label: string;
  value: string | number;
  icon?: string; // Para incluir íconos
  color?: string; // Para personalizar colores
}

interface DropdownComponentProps {
  data: DropdownOption[];
  selectedValue: DropdownOption | DropdownOption[]; // Puede ser único o múltiple
  setSelectedValue: (value: DropdownOption | DropdownOption[]) => void;
  placeholder: string;
  multiselect?: boolean;
  disabled?: boolean;
  errorMessage?: string | string[] | FormikErrors<any> | FormikErrors<any>[];
  blur?: boolean;
  blurIntensity?: number;
  backgroundOpacity?: number;
  iconName?: string;
  iconLibrary?: string;
  iconSize?: number;
  iconColor?: string;
  containerStyle?: object;
  onSearch?: (query: string) => void;
  renderItem?: (item: DropdownOption) => React.ReactNode; // Nueva propiedad para render personalizado
}

const DropdownComponent: React.FC<DropdownComponentProps> = ({
  data,
  selectedValue,
  setSelectedValue,
  placeholder,
  multiselect = false,
  disabled = false,
  errorMessage,
  blur = false,
  blurIntensity = 50,
  backgroundOpacity = 0.3,
  iconName,
  iconLibrary = "MaterialIcons",
  iconSize = 24,
  iconColor = "#333",
  containerStyle = {},
  onSearch,
  renderItem, // Renderizado personalizado
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [borderColor, setBorderColor] = useState("#ccc");
  const IconComponent = iconName && iconLibrary ? Icons[iconLibrary] : null;

  const normalizedErrorMessage = React.useMemo(() => {
    if (Array.isArray(errorMessage)) {
      return errorMessage.join(", ");
    }
    if (typeof errorMessage === "object") {
      return JSON.stringify(errorMessage);
    }
    return errorMessage || "";
  }, [errorMessage]);

  useEffect(() => {
    if (errorMessage) {
      setBorderColor("red");
    } else if (isFocused) {
      setBorderColor("#1976d2");
    } else {
      setBorderColor("#ccc");
    }
  }, [errorMessage, isFocused]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleMultiSelectChange = (values: (string | number)[]) => {
    const selectedItems = values.map(
      (val) => data.find((item) => item.value === val)!
    );
    setSelectedValue(selectedItems);
  };

  const handleDropdownChange = (value: string | number | DropdownOption) => {
    const selectedItem =
      typeof value === "object" ? value : data.find((item) => item.value === value);

    if (selectedItem) {
      setSelectedValue(selectedItem);
    } else {
      console.error("Elemento seleccionado no encontrado en los datos:", value);
    }
  };

  const removeTag = (item: DropdownOption) => {
    if (Array.isArray(selectedValue)) {
      const filteredValues = selectedValue.filter(
        (i) => i.value !== item.value
      );
      setSelectedValue(filteredValues);
    }
  };

  const renderSelectedTags = () => {
    if (!multiselect || !Array.isArray(selectedValue) || selectedValue.length === 0)
      return null;

    return (
      <View style={styles.tagsContainer}>
        {selectedValue.map((item) => (
          <View key={item.value} style={styles.tag}>
            <Text style={styles.tagText}>{item.label}</Text>
            <Icons.MaterialIcons
              name="close"
              size={16}
              color="#fff"
              onPress={() => removeTag(item)}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderDropdownItem = (item: DropdownOption) => {
    if (renderItem) {
      return renderItem(item); // Si se pasa renderItem, úsalo
    }
    // Renderizado por defecto
    return (
      <View style={styles.defaultItem}>
        {item.icon && (
          <Icons.MaterialIcons name={item.icon} size={20} color={item.color || "#000"} />
        )}
        <Text style={[styles.defaultItemText, { color: item.color || "#000" }]}>
          {item.label}
        </Text>
      </View>
    );
  };

  const backgroundStyle = blur
    ? { backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})` }
    : { backgroundColor: "white" };

  const selected = Array.isArray(selectedValue)
    ? selectedValue.map((item) => item.value) // Multiselect
    : selectedValue?.value; // Single select

  const DropdownContent = (
    <View
      style={[
        styles.inputWrapper,
        { borderColor },
        backgroundStyle,
        containerStyle,
      ]}
    >
      <View style={styles.inputIconWrapper}>
        {IconComponent && (
          <IconComponent
            name={iconName}
            size={iconSize}
            color={iconColor}
            style={styles.icon}
          />
        )}
        {multiselect ? (
          <MultiSelect
            style={styles.dropdown}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            value={selected}
            onChange={handleMultiSelectChange}
            disabled={disabled}
            renderItem={renderDropdownItem} // Renderizado personalizado
            search
            onChangeText={onSearch} // Vinculación de onSearch
            visibleSelectedItem={false}
            searchPlaceholder={`Buscar ${placeholder.toLowerCase()}...`}
          />
        ) : (
          <Dropdown
            style={styles.dropdown}
            data={data}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            value={selected}
            onChange={(item) => handleDropdownChange(item)}
            disabled={disabled}
            renderItem={renderDropdownItem} // Renderizado personalizado
            search
            onChangeText={onSearch} // Vinculación de onSearch
            searchPlaceholder={`Buscar ${placeholder.toLowerCase()}...`}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {blur ? (
        <BlurView intensity={blurIntensity} style={styles.blurContainer}>
          {DropdownContent}
        </BlurView>
      ) : (
        DropdownContent
      )}
      {renderSelectedTags()}
      {normalizedErrorMessage && <Text style={styles.errorText}>{normalizedErrorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  blurContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  inputWrapper: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  inputIconWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  dropdown: {
    flex: 1,
    fontSize: 16,
  },
  defaultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  defaultItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#888",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#000",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1976d2",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
  },
  tagText: {
    color: "#fff",
    marginRight: 5,
  },
});

export default DropdownComponent;
