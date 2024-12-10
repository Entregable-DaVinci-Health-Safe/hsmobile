import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem } from '@rneui/themed';

const AccordionItem = ({ title, children, isSelected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <ListItem.Accordion
        content={
          <ListItem.Content>
            <ListItem.Title>{title}</ListItem.Title>
          </ListItem.Content>
        }
        isExpanded={expanded}
        onPress={() => setExpanded(!expanded)}
        onLongPress={onSelect}
        containerStyle={[styles.accordionContainer, isSelected ? styles.selectedAccordion : null]}
      >
        {expanded && children}
      </ListItem.Accordion>
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 5,
  },
  selectedAccordion: {
    backgroundColor: '#e0f7fa',
  },
});

export default AccordionItem;
