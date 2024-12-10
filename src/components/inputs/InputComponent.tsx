import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Animated, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';  // Importamos BlurView para el efecto de desenfoque
import * as Icons from '@expo/vector-icons';  // Importa todos los iconos

const InputComponent = ({
  placeholder,
  value,
  onChangeText = (text?: any) => {},
  onBlur = (event?: any) => {},
  onFocus = () => {},
  errorMessage = undefined,
  keyboardType = 'default',
  multiline = false,
  onPressIn = () => {},
  editable = true,  // Propiedad editable opcional con valor por defecto true
  secureTextEntry = false,  // Propiedad para ocultar el texto, por defecto es false
  iconName = undefined,  // Nombre del ícono
  iconLibrary = 'MaterialIcons',  // Librería del ícono (MaterialIcons por defecto)
  iconSize = 24,  // Tamaño del ícono
  iconColor = '#333',  // Color del ícono
  blur = false,  // Propiedad para controlar si el fondo es cristalino
  blurIntensity = 50,  // Intensidad del desenfoque del fondo
  backgroundOpacity = 0.3,  // Controlar la opacidad del fondo cristalino
  containerStyle = {},  // NUEVA PROPUESTA: permitir estilos personalizados
}) => {
  const [borderColor] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);

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
      Animated.timing(borderColor, {
        toValue: 2,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else if (isFocused) {
      Animated.timing(borderColor, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(borderColor, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [errorMessage, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    if (event?.persist) event.persist();
    onBlur(event);
  };

  const handleChangeText = (text) => {
    onChangeText(text);
  };

  const IconComponent = Icons[iconLibrary];

  const backgroundStyle = blur
    ? {
        backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
      }
    : { backgroundColor: 'white' };

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
                  outputRange: ['#ccc', '#1976d2', 'red'],
                }),
              },
            ]}
          >
            <View style={styles.inputIconWrapper}>
              {iconName && IconComponent && (
                <IconComponent
                  name={iconName}
                  size={iconSize}
                  color={iconColor}
                  style={styles.icon}
                />
              )}
              <TextInput
                placeholder={placeholder}
                style={styles.inputStyle}
                onChangeText={handleChangeText}
                onBlur={handleBlur}
                onFocus={handleFocus}
                keyboardType={keyboardType as any}
                value={value}
                multiline={multiline}
                onPressIn={onPressIn}
                editable={editable}
                secureTextEntry={secureTextEntry}
              />
            </View>
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
                outputRange: ['#ccc', '#1976d2', 'red'],
              }),
            },
          ]}
        >
          <View style={styles.inputIconWrapper}>
            {iconName && IconComponent && (
              <IconComponent
                name={iconName}
                size={iconSize}
                color={iconColor}
                style={styles.icon}
              />
            )}
            <TextInput
              placeholder={placeholder}
              style={styles.inputStyle}
              onChangeText={handleChangeText}
              onBlur={handleBlur}
              onFocus={handleFocus}
              keyboardType={keyboardType as any}
              value={value}
              multiline={multiline}
              onPressIn={onPressIn}
              editable={editable}
              secureTextEntry={secureTextEntry}
            />
          </View>
        </Animated.View>
      )}
    {normalizedErrorMessage && <Text style={styles.errorText}>{normalizedErrorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputStyle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 3,
    marginLeft: 5,
  },
});

export default InputComponent;
