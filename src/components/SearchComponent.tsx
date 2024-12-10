import React from 'react';
import { SearchBar } from '@rneui/themed';

const SearchComponent = ({ value, onChangeText, placeholder }) => {
  return (
    <SearchBar
      platform="android"
      placeholder={placeholder || "Buscar..."}
      onChangeText={onChangeText}
      value={value}
    />
  );
};

export default SearchComponent;
