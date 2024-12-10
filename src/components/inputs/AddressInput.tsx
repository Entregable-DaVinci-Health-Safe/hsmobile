import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ApiKeyGoogle } from '../../contextos/ApiKeyGoogle';
import InputComponent from '../../components/inputs/InputComponent'; // Importamos el InputComponent

const AddressInput = ({ onSelectAddress }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (text) => {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${ApiKeyGoogle}&language=es&components=country:ar`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      setSuggestions(json.predictions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleTextChange = (text) => {
    setInputValue(text);
    if (text.length > 2) {
      fetchSuggestions(text);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion.description);
    setSuggestions([]);
    onSelectAddress({
      direccionCompleta: suggestion.description,
    });
  };

  return (
    <View style={styles.container}>
      <InputComponent
        placeholder="Escriba la dirección..."
        value={inputValue}
        onChangeText={handleTextChange} // Usa la función que maneja los cambios de texto
      />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestion}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text style={styles.suggestionText}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  suggestion: {
    backgroundColor: '#FFF',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
});

export default AddressInput;
