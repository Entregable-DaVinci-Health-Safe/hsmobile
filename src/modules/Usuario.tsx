import { useLayoutEffect, useState } from 'react';
import axios from 'axios';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar, Button, Card, Divider, Icon, ListItem, Text } from '@rneui/themed';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';


const Usuario: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
      
    const settingsOptions = [
        {
          title: 'Foto de Perfil',
          icon: 'account-circle',
          direccion: 'FotoPerfil',
          fuente: 'MaterialCommunityIcons'
        },
        {
          title: 'Informacion',
          icon: 'information',
          direccion: 'Informacion',
          fuente: 'material-community'
        },
        {
          title: 'Contactos',
          icon: 'contact-page',
          direccion: 'Contactos',
          fuente: 'MaterialIcons'
        },
      ];

    return (
<ScrollView>
      <View>
        {settingsOptions.map((option, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => navigation.navigate(option.direccion)}
            activeOpacity={0.7}
          >
            <ListItem bottomDivider>
              <Icon name={option.icon} type={option.fuente} />
              <ListItem.Content>
                <ListItem.Title>{option.title}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView> 
    );
};

export default Usuario;
