import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import DatePicker from "react-native-date-picker";
import * as Icons from "@expo/vector-icons";
import { FormikErrors } from "formik";

interface DatePickerComponentProps {
  date?: Date; // Ahora es opcional
  setDate: (date: Date) => void;
  formatDate: (date: Date) => string;
  placeholder: string;
  needsTime?: boolean;
  errorMessage?: string | string[] | FormikErrors<any> | FormikErrors<any>[];
  iconName?: string;
  iconLibrary?: string;
  iconSize?: number;
  iconColor?: string;
  blur?: boolean;
  blurIntensity?: number;
  backgroundOpacity?: number;
  containerStyle?: object;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  date,
  setDate,
  formatDate,
  placeholder,
  needsTime = false,
  errorMessage,
  iconName = "calendar-month",
  iconLibrary = "MaterialIcons",
  iconSize = 24,
  iconColor = "#333",
  blur = false,
  blurIntensity = 50,
  backgroundOpacity = 0.3,
  containerStyle = {},
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [borderColor] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);
  const IconComponent = iconLibrary ? Icons[iconLibrary] : null;

  const normalizedErrorMessage = React.useMemo(() => {
    if (Array.isArray(errorMessage)) {
      return errorMessage.join(", ");
    }
    if (typeof errorMessage === "object") {
      return JSON.stringify(errorMessage);
    }
    return errorMessage || "";
  }, [errorMessage]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColor, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColor, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleOpenPicker = () => {
    handleFocus();
    setShowPicker(true);
  };

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    setShowPicker(false);
    handleBlur();
  };

  const handleCancel = () => {
    setShowPicker(false);
    handleBlur();
  };

  const backgroundStyle = blur
    ? {
        backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
      }
    : { backgroundColor: "white" };

  return (
    <View style={[styles.container, containerStyle]}>
      {blur ? (
        <BlurView intensity={blurIntensity} style={styles.blurContainer}>
          <Animated.View
            style={[
              styles.inputWrapper,
              backgroundStyle,
              {
                borderColor: borderColor.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: ["#ccc", "#1976d2", "red"],
                }),
              },
            ]}
          >
            <TouchableOpacity onPress={handleOpenPicker}>
              <View style={styles.inputIconWrapper}>
                {iconName && IconComponent && (
                  <IconComponent
                    name={iconName}
                    size={iconSize}
                    color={iconColor}
                    style={styles.icon}
                  />
                )}
                <Text
                  style={[
                    styles.inputStyle,
                    !date && { color: "#888" }, // Cambia el color del placeholder si no hay fecha
                  ]}
                >
                  {date ? formatDate(date) : placeholder}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      ) : (
        <Animated.View
          style={[
            styles.inputWrapper,
            backgroundStyle,
            {
              borderColor: borderColor.interpolate({
                inputRange: [0, 1, 2],
                outputRange: ["#ccc", "#1976d2", "red"],
              }),
            },
          ]}
        >
          <TouchableOpacity onPress={handleOpenPicker}>
            <View style={styles.inputIconWrapper}>
              {iconName && IconComponent && (
                <IconComponent
                  name={iconName}
                  size={iconSize}
                  color={iconColor}
                  style={styles.icon}
                />
              )}
              <Text
                style={[
                  styles.inputStyle,
                  !date && { color: "#888" }, // Cambia el color del placeholder si no hay fecha
                ]}
              >
                {date ? formatDate(date) : placeholder}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {showPicker && (
        <DatePicker
          modal
          open={showPicker}
          date={date || new Date()} // Usa la fecha actual si no hay fecha seleccionada
          mode={needsTime ? "datetime" : "date"}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

    {normalizedErrorMessage && <Text style={styles.errorText}>{normalizedErrorMessage}</Text>}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    width: "100%",
  },
  blurContainer: {
    borderRadius: 10,
  },
  inputWrapper: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inputIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputStyle: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default DatePickerComponent;
