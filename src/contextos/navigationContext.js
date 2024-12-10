import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const useNavigationContext = () => useContext(NavigationContext);

export const NavigationProvider = ({ children }) => {
  const [gesturesBlocked, setGesturesBlocked] = useState(false);

  return (
    <NavigationContext.Provider value={{ gesturesBlocked, setGesturesBlocked }}>
      {children}
    </NavigationContext.Provider>
  );
};
