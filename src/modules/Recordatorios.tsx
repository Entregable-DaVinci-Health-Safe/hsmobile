import { useState } from 'react';
import axios from 'axios';
import { View, Text } from 'react-native';
import { Button } from '@rneui/themed';


const Recordatorios: React.FC = () => {

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Recordatorios Screen</Text>
        <Button size="lg">Large</Button>
      </View>
    );
};

export default Recordatorios;
