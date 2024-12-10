import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LocationItemProps {
  place_id: string;
  description: string;
  fetchDetails: (placeId: string) => Promise<any>;
  onSelect: (description: string) => void; // Nuevo prop para manejar la selección
}

class LocationItem extends PureComponent<LocationItemProps> {
  _handlePress = async () => {
    const res = await this.props.fetchDetails(this.props.place_id);
    this.props.onSelect(this.props.description); // Llama a la función onSelect con la descripción
  }

  render() {
    return (
      <TouchableOpacity style={styles.root} onPress={this._handlePress}>
        <Text>{this.props.description}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    height: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  }
});

export default LocationItem;
