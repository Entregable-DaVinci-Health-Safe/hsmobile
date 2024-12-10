import React, { createContext, useContext, useState } from 'react';

interface LoadingContextProps {
    loading: boolean;
    message: string | null;
    updateAvatar: () => void;
  }

const AvatarContext = createContext<LoadingContextProps | undefined>(undefined);;

export const useAvatar = () => useContext(AvatarContext);

export const AvatarProvider = ({ children }) => {
  const [avatar, setAvatar] = useState('');

  const updateAvatar = (newAvatar) => {
    setAvatar(newAvatar);
  };

  return (
    <AvatarContext.Provider value={{ avatar, updateAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};
