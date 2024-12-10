import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Dialog } from "@rneui/themed";

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertCustomProps {
  visible: boolean;
  onClose?: () => void;
  title: string;
  message: string | object;
  buttons?: ButtonProps[];
}

const AlertCustom: React.FC<AlertCustomProps> = ({
  visible,
  onClose,
  title,
  message,
  buttons,
}) => {
  
  const formattedMessage =
    typeof message === "object" ? JSON.stringify(message, null, 2) : message;

  
  const renderCustomButtons = () => {
    if (!buttons || buttons.length === 0) return null;

    return (
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.customButton,
              button.style === "cancel" && styles.cancelButton,
              button.style === "destructive" && styles.destructiveButton,
              (!button.style || button.style === "default") && styles.defaultButton,
            ]}
            onPress={() => {
              button.onPress();
              if (onClose) onClose(); 
            }}
          >
            <Text style={styles.customButtonText}>{button.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Dialog
      isVisible={visible}
      onBackdropPress={onClose} 
      overlayStyle={styles.dialogContainer}
    >
      <Dialog.Title title={title} />
      <Text style={styles.messageText}>{formattedMessage}</Text>
      {renderCustomButtons()}
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  customButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  customButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#a0a0a0",
  },
  defaultButton: {
    backgroundColor: "#5BACFF",
  },
  destructiveButton: {
    backgroundColor: "#d9534f",
  },
});

export default AlertCustom;
