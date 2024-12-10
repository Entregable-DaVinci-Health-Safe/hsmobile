import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import * as Icons from '@expo/vector-icons';
const ButtonHealth = ({
  title = '',
  onPress = () => {},
  style = {},
  iconName = undefined,
  iconLibrary = 'MaterialIcons',
  iconSize = 24,
  iconColor = '#fff',
  size = 'medium', // Tamaño predeterminado
}) => {
  const animatedValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: animatedValue }],
  };

  const IconComponent = Icons[iconLibrary];

  // Estilos dinámicos basados en el tamaño
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[styles.button, getSizeStyle(), style]} // Agrega los estilos dinámicos
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View style={styles.contentContainer}>
          {iconName && IconComponent && (
            <IconComponent
              name={iconName}
              size={iconSize}
              color={iconColor}
              style={title ? styles.iconWithText : styles.iconOnly} // Estilo ajustado según el título
            />
          )}
          {title ? <Text style={[styles.buttonText, { marginLeft: iconName ? 10 : 0 }]}>{title}</Text> : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#5BACFF',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconWithText: {
    marginRight: 5,
  },
  iconOnly: {
    marginRight: 0, // Sin margen si solo se muestra el ícono
  },
});

export default ButtonHealth;
